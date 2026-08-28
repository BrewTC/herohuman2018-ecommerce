import crypto from "crypto";
import "../../../lib/loadServerEnv";
import {
  createOrderEvent,
  getOrderByOrderNo,
  isSupabaseConfigured,
  updateOrderByOrderNo,
} from "../../../lib/supabaseAdmin";

function calculateCheckMacValue(params) {
  const { ECPAY_HASH_KEY, ECPAY_HASH_IV } = process.env;

  if (!ECPAY_HASH_KEY || !ECPAY_HASH_IV) {
    throw new Error("缺少 ECPAY_HASH_KEY 或 ECPAY_HASH_IV 環境變數");
  }

  const cleanParams = { ...params };
  delete cleanParams.CheckMacValue;

  Object.keys(cleanParams).forEach((key) => {
    if (cleanParams[key] === null || cleanParams[key] === undefined) cleanParams[key] = "";
  });

  const sortedKeys = Object.keys(cleanParams).sort();
  const rawData = sortedKeys.map((key) => `${key}=${cleanParams[key]}`).join("&");
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

  return crypto.createHash("sha256").update(encodedString).digest("hex").toUpperCase();
}

function isValidCheckMacValue(params) {
  if (!params.CheckMacValue) return false;

  const expected = calculateCheckMacValue(params);
  const received = String(params.CheckMacValue).toUpperCase();

  if (expected.length !== received.length) return false;

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

function parseEcpayDate(value) {
  if (!value) return new Date().toISOString();

  const match = String(value).match(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return new Date().toISOString();

  const [, year, month, day, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`;
}

function plainText(message, status = 200) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export async function POST(req) {
  let params = {};

  try {
    const formData = await req.formData();
    params = Object.fromEntries(formData.entries());

    if (!isSupabaseConfigured()) {
      console.error("綠界付款通知失敗：Supabase 尚未設定");
      return plainText("0|Supabase Not Configured", 500);
    }

    if (!isValidCheckMacValue(params)) {
      await createOrderEvent({
        eventType: "ecpay_notification_rejected",
        message: "綠界付款通知 CheckMacValue 驗證失敗",
        rawPayload: params,
      });
      return plainText("0|CheckMacValue Error", 400);
    }

    const merchantTradeNo = String(params.MerchantTradeNo || "").slice(0, 20);

    if (!merchantTradeNo) {
      await createOrderEvent({
        eventType: "ecpay_notification_rejected",
        message: "綠界付款通知缺少 MerchantTradeNo",
        rawPayload: params,
      });
      return plainText("0|Missing MerchantTradeNo", 400);
    }

    const order = await getOrderByOrderNo(merchantTradeNo);

    if (!order) {
      await createOrderEvent({
        eventType: "ecpay_notification_order_not_found",
        message: `找不到綠界通知對應訂單：${merchantTradeNo}`,
        rawPayload: params,
      });
      return plainText("0|Order Not Found", 404);
    }

    const rtnCode = String(params.RtnCode || "");
    const amountMatches =
      !params.TradeAmt || Math.round(Number(params.TradeAmt)) === Math.round(Number(order.total_amount));

    if (!amountMatches) {
      await createOrderEvent({
        orderId: order.id,
        eventType: "ecpay_notification_amount_mismatch",
        message: `綠界付款通知金額不符：通知 ${params.TradeAmt}，訂單 ${order.total_amount}`,
        rawPayload: params,
      });
      return plainText("0|Amount Mismatch", 400);
    }

    const isPaid = rtnCode === "1";
    const isPendingConfirmation = rtnCode === "10300066";
    const eventType = isPaid
      ? "ecpay_payment_paid"
      : isPendingConfirmation
        ? "ecpay_payment_pending_confirmation"
        : "ecpay_payment_failed";
    const message = isPaid
      ? `綠界付款完成：${params.RtnMsg || "paid"}`
      : isPendingConfirmation
        ? `綠界付款待確認：${params.RtnMsg || "請至廠商後台確認"}`
      : `綠界付款未完成：${params.RtnMsg || `RtnCode ${rtnCode || "unknown"}`}`;

    if (isPaid) {
      if (order.payment_status !== "paid") {
        await updateOrderByOrderNo(merchantTradeNo, {
          payment_status: "paid",
          ecpay_trade_no: params.TradeNo || order.ecpay_trade_no || null,
          paid_at: parseEcpayDate(params.PaymentDate),
          note: params.PaymentType ? `付款方式：${params.PaymentType}` : order.note,
        });
      }
    } else if (isPendingConfirmation && order.payment_status !== "paid") {
      await updateOrderByOrderNo(merchantTradeNo, {
        payment_status: "pending_payment",
        ecpay_trade_no: params.TradeNo || order.ecpay_trade_no || null,
        note: params.RtnMsg || "綠界付款結果待確認，請勿出貨",
      });
    } else if (order.payment_status !== "paid") {
      await updateOrderByOrderNo(merchantTradeNo, {
        payment_status: "failed",
        ecpay_trade_no: params.TradeNo || order.ecpay_trade_no || null,
        note: params.RtnMsg || `綠界回傳 RtnCode ${rtnCode || "unknown"}`,
      });
    }

    await createOrderEvent({
      orderId: order.id,
      eventType,
      message,
      rawPayload: params,
    });

    return plainText("1|OK");
  } catch (error) {
    console.error("綠界付款通知處理失敗:", error);

    try {
      if (isSupabaseConfigured()) {
        await createOrderEvent({
          eventType: "ecpay_notification_error",
          message: error.message || "綠界付款通知處理失敗",
          rawPayload: params,
        });
      }
    } catch (eventError) {
      console.error("綠界付款通知錯誤事件寫入失敗:", eventError);
    }

    return plainText("0|Server Error", 500);
  }
}
