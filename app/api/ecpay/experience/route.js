import crypto from "crypto";
import { NextResponse } from "next/server";
import "../../../lib/loadServerEnv";
import { getExperienceById } from "../../../data/experiences";
import { createProductOrder, isSupabaseConfigured } from "../../../lib/supabaseAdmin";

function calculateCheckMacValue(params) {
  const { ECPAY_HASH_KEY, ECPAY_HASH_IV } = process.env;

  if (!ECPAY_HASH_KEY || !ECPAY_HASH_IV) {
    throw new Error("缺少 ECPAY_HASH_KEY 或 ECPAY_HASH_IV 環境變數");
  }

  delete params.CheckMacValue;
  Object.keys(params).forEach((key) => {
    if (params[key] === null || params[key] === undefined) params[key] = "";
  });

  const sortedKeys = Object.keys(params).sort();
  const rawData = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
  const checkValueString = `HashKey=${ECPAY_HASH_KEY}&${rawData}&HashIV=${ECPAY_HASH_IV}`;

  const encodedString = encodeURIComponent(checkValueString)
    .replace(/%2[dD]/g, "-")
    .replace(/%5[fF]/g, "_")
    .replace(/%2[eE]/g, ".")
    .replace(/%21/g, "!")
    .replace(/%2[aA]/g, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")")
    .replace(/%20/g, "+")
    .toLowerCase();

  return crypto
    .createHash("sha256")
    .update(encodedString)
    .digest("hex")
    .toUpperCase();
}

function sanitizeText(text, maxLength = 200) {
  if (!text) return "";
  return String(text)
    .replace(/[<>"'`]/g, "")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req) {
  try {
    const {
      orderId,
      experienceId,
      sessionId,
      participantCount,
      amount,
      name,
      email,
      phone,
      participants,
      allergies,
      notes,
    } = await req.json();

    const experience = getExperienceById(experienceId);

    if (!experience) {
      return NextResponse.json({ success: false, message: "找不到課程資料" }, { status: 400 });
    }

    const session = experience.sessions.find((item) => item.id === sessionId);

    if (!session) {
      return NextResponse.json({ success: false, message: "找不到課程場次" }, { status: 400 });
    }

    const cleanOrderId = sanitizeText(orderId, 20);
    const cleanName = sanitizeText(name, 50);
    const cleanEmail = sanitizeText(email, 120);
    const cleanPhone = sanitizeText(phone, 20);
    const cleanParticipants = sanitizeText(participants, 300);
    const cleanAllergies = sanitizeText(allergies, 300);
    const cleanNotes = sanitizeText(notes, 300);
    const count = Number(participantCount);
    const expectedAmount = experience.price * count;

    if (!cleanOrderId) {
      return NextResponse.json({ success: false, message: "缺少訂單編號" }, { status: 400 });
    }

    if (!cleanName || !cleanEmail || !cleanPhone) {
      return NextResponse.json({ success: false, message: "請填寫完整報名人資訊" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ success: false, message: "電子郵件格式不正確" }, { status: 400 });
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      return NextResponse.json({ success: false, message: "電話號碼格式不正確" }, { status: 400 });
    }

    if (!Number.isInteger(count) || count <= 0 || count > session.remaining) {
      return NextResponse.json({ success: false, message: "報名人數無效或超過剩餘名額" }, { status: 400 });
    }

    if (Math.round(Number(amount)) !== expectedAmount) {
      return NextResponse.json({ success: false, message: "付款金額與課程費用不符" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, message: "尚未設定 Supabase 訂單資料庫環境變數" },
        { status: 500 }
      );
    }

    const MerchantTradeDate = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")
      .replace(/-/g, "/");

    const itemName = `${experience.subtitle} x${count}`.slice(0, 200);

    await createProductOrder({
      order: {
        order_no: cleanOrderId.slice(0, 20),
        order_type: "experience",
        customer_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        address: "",
        total_amount: expectedAmount,
        payment_status: "pending_payment",
        fulfillment_status: "unfulfilled",
        ecpay_merchant_trade_no: cleanOrderId.slice(0, 20),
        raw_payload: {
          experienceId,
          sessionId,
          session,
          participantCount: count,
          participants: cleanParticipants,
          allergies: cleanAllergies,
          notes: cleanNotes,
        },
      },
      items: [
        {
          item_type: "experience",
          item_id: `${experience.id}:${session.id}`,
          item_name: `${experience.title} - ${experience.subtitle}`.slice(0, 120),
          unit_price: experience.price,
          quantity: count,
          subtotal: expectedAmount,
          raw_payload: {
            experience,
            session,
          },
        },
      ],
    });

    const tradeData = {
      MerchantID: process.env.ECPAY_MERCHANT_ID || "3444033",
      MerchantTradeNo: cleanOrderId.slice(0, 20),
      MerchantTradeDate,
      PaymentType: "aio",
      TotalAmount: expectedAmount,
      TradeDesc: "食農教育體驗報名",
      ItemName: itemName,
      ReturnURL: process.env.ECPAY_EXPERIENCE_RETURN_URL || process.env.ECPAY_RETURN_URL || "https://www.facebook.com/herohuman2018/",
      ClientBackURL: process.env.ECPAY_CLIENT_BACK_URL || "https://mattdataadventures.com/",
      ChoosePayment: "ALL",
      EncryptType: 1,
    };

    tradeData.CheckMacValue = calculateCheckMacValue({ ...tradeData });

    const paymentUrl =
      process.env.ECPAY_PAYMENT_URL ||
      process.env.ECPAY_CHECKOUT_URL ||
      "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";

    const formHtml = `
      <html>
      <head>
        <meta charset="utf-8" />
        <title>課程報名確認</title>
        <style>
          body { font-family: Arial, "Noto Sans TC", sans-serif; max-width: 680px; margin: 20px auto; padding: 20px; color: #3f3a36; background: #f8f6f2; }
          h2 { margin-bottom: 16px; }
          .section { background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 16px; padding: 18px; margin-bottom: 16px; }
          .row { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid rgba(0,0,0,.06); padding: 8px 0; }
          .row:last-child { border-bottom: 0; }
          .muted { color: #7a736e; }
          .total { font-size: 20px; font-weight: 700; text-align: right; }
          button { background-color: #f3dfcf; color: #3f3a36; padding: 12px 20px; border: none; border-radius: 999px; cursor: pointer; width: 100%; font-weight: 700; }
          button:hover { background-color: #eed3bf; }
        </style>
      </head>
      <body>
        <h2>課程報名確認</h2>
        <div class="section">
          <h3>${escapeHtml(experience.title)}</h3>
          <p class="muted">${escapeHtml(experience.subtitle)}</p>
          <div class="row"><span>場次</span><strong>${escapeHtml(session.date)} ${escapeHtml(session.time)}</strong></div>
          <div class="row"><span>報名人數</span><strong>${count} 人</strong></div>
          <div class="row"><span>報名人</span><strong>${escapeHtml(cleanName)}</strong></div>
          <div class="row"><span>Email</span><strong>${escapeHtml(cleanEmail)}</strong></div>
          <div class="row"><span>電話</span><strong>${escapeHtml(cleanPhone)}</strong></div>
        </div>
        <div class="section">
          <h3>補充資訊</h3>
          <p><strong>參加者：</strong>${escapeHtml(cleanParticipants || "未提供")}</p>
          <p><strong>過敏或特殊需求：</strong>${escapeHtml(cleanAllergies || "未提供")}</p>
          <p><strong>備註：</strong>${escapeHtml(cleanNotes || "未提供")}</p>
          <p class="total">總金額：NT$ ${expectedAmount}</p>
        </div>
        <form id="ecpay-form" action="${paymentUrl}" method="POST">
          ${Object.keys(tradeData)
            .map((key) => `<input type="hidden" name="${key}" value="${escapeHtml(tradeData[key])}">`)
            .join("\n")}
          <button type="submit">前往綠界付款</button>
        </form>
      </body>
      </html>
    `;

    return new Response(formHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("食農教育體驗付款 API 錯誤:", error);
    return NextResponse.json(
      { success: false, message: error.message || "伺服器錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
