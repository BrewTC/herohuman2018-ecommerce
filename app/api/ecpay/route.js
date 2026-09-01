import crypto from 'crypto';
import { NextResponse } from 'next/server';
import '../../lib/loadServerEnv';
import { createProductOrder, isSupabaseConfigured } from '../../lib/supabaseAdmin';
import { resolveCheckoutProducts } from '../../lib/productCatalog';

function createMerchantTradeNo() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `ORD${timestamp}${random}`.slice(0, 20);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function calculateCheckMacValue(params) {
  const { ECPAY_HASH_KEY, ECPAY_HASH_IV } = process.env;

  // 檢查環境變數
  if (!ECPAY_HASH_KEY || !ECPAY_HASH_IV) {
    throw new Error('缺少 ECPAY_HASH_KEY 或 ECPAY_HASH_IV 環境變數');
  }

  delete params.CheckMacValue;
  Object.keys(params).forEach((key) => {
    if (params[key] === null || params[key] === undefined) params[key] = '';
  });

  const sortedKeys = Object.keys(params).sort();
  const rawData = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');
  const checkValueString = `HashKey=${ECPAY_HASH_KEY}&${rawData}&HashIV=${ECPAY_HASH_IV}`;

  let encodedString = encodeURIComponent(checkValueString)
    .replace(/%2[dD]/g, '-')
    .replace(/%5[fF]/g, '_')
    .replace(/%2[eE]/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2[aA]/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%20/g, '+')
    .toLowerCase();

  const checkMacValue = crypto
    .createHash('sha256')
    .update(encodedString)
    .digest('hex')
    .toUpperCase();

  return checkMacValue;
}

export async function POST(req) {
  try {
    const { expectedAmount, name, email, phone, address, items = [] } = await req.json();
    console.log('接收到商品訂單請求:', { expectedAmount, itemCount: items.length });

    const customerName = String(name ?? '').trim().slice(0, 50);
    const customerEmail = String(email ?? '').trim().toLowerCase().slice(0, 120);
    const customerPhone = String(phone ?? '').trim().slice(0, 20);
    const customerAddress = String(address ?? '').trim().slice(0, 200);

    // 驗證必要參數
    if (!customerName || !customerEmail || !customerPhone) {
      console.log('商品訂單缺少必要的顧客欄位');
      return NextResponse.json(
        { success: false, message: '缺少客戶姓名、電子郵件或電話' },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json(
        { success: false, message: '電子郵件格式不正確' },
        { status: 400 }
      );
    }
    if (!/^\d{10}$/.test(customerPhone)) {
      return NextResponse.json(
        { success: false, message: '電話號碼需為 10 位數字' },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: '缺少訂單商品明細' },
        { status: 400 }
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { success: false, message: '單筆訂單商品種類過多' },
        { status: 400 }
      );
    }

    const { items: resolvedItems, source: catalogSource } = await resolveCheckoutProducts(items);
    const cleanItems = resolvedItems.map(({ product, quantity, subtotal }) => ({
      item_type: 'product',
      item_id: String(product.id),
      item_name: product.name.slice(0, 120),
      unit_price: product.price,
      quantity,
      subtotal,
      raw_payload: {
        product_id: product.id,
        legacy_id: product.legacyId,
        sku: product.sku,
        slug: product.slug,
      },
    }));
    const calculatedAmount = cleanItems.reduce((sum, item) => sum + item.subtotal, 0);

    if (calculatedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: '訂單金額無效' },
        { status: 400 }
      );
    }

    if (Math.round(Number(expectedAmount)) !== calculatedAmount) {
      return NextResponse.json(
        { success: false, message: '商品價格已有更新，請重新整理頁面後再結帳' },
        { status: 409 }
      );
    }

    const orderId = createMerchantTradeNo();
    const itemName = cleanItems
      .map((item) => `${item.item_name.substring(0, 30)} x${item.quantity}`)
      .join('#')
      .slice(0, 380);

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, message: '尚未設定 Supabase 訂單資料庫環境變數' },
        { status: 500 }
      );
    }

    await createProductOrder({
      order: {
        order_no: orderId.slice(0, 20),
        order_type: 'product',
        customer_name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
        total_amount: calculatedAmount,
        payment_status: 'pending_payment',
        fulfillment_status: 'unfulfilled',
        ecpay_merchant_trade_no: orderId.slice(0, 20),
        raw_payload: {
          itemName,
          catalogSource,
          items: cleanItems.map((item) => item.raw_payload),
        },
      },
      items: cleanItems,
    });

    // 交易日期
    const MerchantTradeDate = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ')
      .replace(/-/g, '/');

    // 綠界支付參數
    const tradeData = {
      MerchantID: process.env.ECPAY_MERCHANT_ID || '3444033',
      MerchantTradeNo: orderId.slice(0, 20),
      MerchantTradeDate,
      PaymentType: 'aio',
      TotalAmount: calculatedAmount,
      TradeDesc: '網站訂單',
      ItemName: itemName.slice(0, 200),
      ReturnURL: process.env.ECPAY_RETURN_URL || 'https://www.facebook.com/herohuman2018/',
      ClientBackURL: process.env.ECPAY_CLIENT_BACK_URL || 'https://mattdataadventures.com/',
      ChoosePayment: 'ALL',
      EncryptType: 1,
    };

    tradeData.CheckMacValue = calculateCheckMacValue({ ...tradeData });
    console.log('生成綠界付款參數:', { MerchantTradeNo: tradeData.MerchantTradeNo, TotalAmount: tradeData.TotalAmount, catalogSource });

    // 將 itemName 分割為單個商品項目
    const displayItems = itemName.split('#').map((item) => {
      const [name, quantity] = item.split(' x');
      return { name, quantity: parseInt(quantity) };
    });

    // 生成確認頁面 HTML
    const paymentUrl = process.env.ECPAY_PAYMENT_URL || process.env.ECPAY_CHECKOUT_URL || 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
    const formHtml = `
      <html>
      <head>
        <title>訂單確認</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; }
          h2 { color: #333; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #555; margin-bottom: 10px; }
          .section p { margin: 5px 0; }
          .items { border-top: 1px solid #ddd; padding-top: 10px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total { font-weight: bold; text-align: right; margin-top: 10px; }
          button { background-color: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; width: 100%; }
          button:hover { background-color: #218838; }
        </style>
      </head>
      <body>
        <h2>訂單確認</h2>
        <div class="section">
          <h3>客戶資訊</h3>
          <p><strong>姓名:</strong> ${escapeHtml(customerName)}</p>
          <p><strong>電子郵件:</strong> ${escapeHtml(customerEmail)}</p>
          <p><strong>電話號碼:</strong> ${escapeHtml(customerPhone)}</p>
          <p><strong>住址:</strong> ${escapeHtml(customerAddress || '未提供')}</p>
        </div>
        <div class="section">
          <h3>訂單明細</h3>
          <div class="items">
            ${displayItems
              .map(
                (item) =>
                  `<div class="item"><span>${escapeHtml(item.name)}</span><span>x${item.quantity}</span></div>`
              )
              .join('')}
          </div>
          <div class="total">總金額：$${calculatedAmount}</div>
        </div>
        <form id="ecpay-form" action="${paymentUrl}" method="POST">
          ${Object.keys(tradeData)
            .map(
              (key) => `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(tradeData[key])}">`
            )
            .join('\n')}
          <button type="submit">前往綠界付款</button>
        </form>
      </body>
      </html>
    `;

    return new Response(formHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('綠界支付 API 錯誤:', error);
    return NextResponse.json(
      { success: false, message: error.message || '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

// import crypto from 'crypto';
// import { NextResponse } from 'next/server';

// function calculateCheckMacValue(params) {
//   const { ECPAY_HASH_KEY, ECPAY_HASH_IV } = process.env;

//   delete params.CheckMacValue;
//   Object.keys(params).forEach((key) => {
//     if (params[key] === null || params[key] === undefined) params[key] = '';
//   });

//   const sortedKeys = Object.keys(params).sort();
//   const rawData = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');
//   const checkValueString = `HashKey=${ECPAY_HASH_KEY}&${rawData}&HashIV=${ECPAY_HASH_IV}`;

//   let encodedString = encodeURIComponent(checkValueString)
//     .replace(/%2[dD]/g, '-')
//     .replace(/%5[fF]/g, '_')
//     .replace(/%2[eE]/g, '.')
//     .replace(/%21/g, '!')
//     .replace(/%2[aA]/g, '*')
//     .replace(/%28/g, '(')
//     .replace(/%29/g, ')')
//     .replace(/%20/g, '+')
//     .toLowerCase();

//   const checkMacValue = crypto
//     .createHash('sha256')
//     .update(encodedString)
//     .digest('hex')
//     .toUpperCase();

//   return checkMacValue;
// }

// export async function POST(req) {
//   try {
//     const { orderId, amount, itemName } = await req.json();
//     console.log('接收到的請求資料:', { orderId, amount, itemName });

//     // 驗證必要參數
//     if (!orderId) {
//       console.log('缺少 orderId:', orderId);
//       return NextResponse.json(
//         { success: false, message: '缺少訂單編號' },
//         { status: 400 }
//       );
//     }
//     if (!amount || amount <= 0) {
//       console.log('無效金額:', amount);
//       return NextResponse.json(
//         { success: false, message: '金額無效或缺失' },
//         { status: 400 }
//       );
//     }
//     if (!itemName || itemName.trim() === '') {
//       console.log('無效商品名稱:', itemName);
//       return NextResponse.json(
//         { success: false, message: '商品名稱無效或缺失' },
//         { status: 400 }
//       );
//     }

//     // 交易日期
//     const MerchantTradeDate = new Date()
//       .toISOString()
//       .slice(0, 19)
//       .replace('T', ' ')
//       .replace(/-/g, '/');

//     // 綠界支付參數
//     const tradeData = {
//       MerchantID: process.env.ECPAY_MERCHANT_ID || '3444033',
//       MerchantTradeNo: orderId.slice(0, 20), // 使用前端傳來的 orderId，限制長度
//       MerchantTradeDate,
//       PaymentType: 'aio',
//       TotalAmount: Math.round(amount),
//       TradeDesc: '網站訂單',
//       ItemName: itemName.slice(0, 200),
//       ReturnURL: process.env.ECPAY_RETURN_URL || 'https://www.facebook.com/herohuman2018/',
//       ClientBackURL: process.env.ECPAY_CLIENT_BACK_URL || 'https://mattdataadventures.com/',
//       ChoosePayment: 'ALL',
//       EncryptType: 1,
//     };

//     tradeData.CheckMacValue = calculateCheckMacValue({ ...tradeData });
//     console.log('生成的綠界參數:', tradeData);

//     // 生成表單 HTML
//     const paymentUrl = process.env.ECPAY_PAYMENT_URL || 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
//     const formHtml = `
//       <html>
//       <body onload="document.getElementById('ecpay-form').submit();">
//         <form id="ecpay-form" action="${paymentUrl}" method="POST">
//           ${Object.keys(tradeData)
//             .map(
//               (key) => `<input type="hidden" name="${key}" value="${tradeData[key]}">`
//             )
//             .join('\n')}
//           <button type="submit">前往綠界付款</button>
//         </form>
//       </body>
//       </html>
//     `;

//     return new Response(formHtml, {
//       status: 200,
//       headers: { 'Content-Type': 'text/html' },
//     });
//   } catch (error) {
//     console.error('綠界支付 API 錯誤:', error);
//     return NextResponse.json(
//       { success: false, message: error.message || '伺服器錯誤，請稍後再試' },
//       { status: 500 }
//     );
//   }
// }
