import "./loadServerEnv";

const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

async function supabaseRequest(path, options = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase 尚未設定，請確認 SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY");
  }

  let response;

  try {
    response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(options.headers || {}),
      },
      cache: "no-store",
    });
  } catch {
    const host = new URL(supabaseUrl).hostname;
    throw new Error(`無法連線到 Supabase 專案 ${host}，請確認 SUPABASE_URL / SUPABASE_PROJECT_URL 是否正確`);
  }

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = typeof data === "object" && data?.message ? data.message : text;
    throw new Error(`Supabase API 錯誤：${message || response.statusText}`);
  }

  return data;
}

export async function createProductOrder({ order, items }) {
  const insertedOrders = await supabaseRequest("orders", {
    method: "POST",
    body: JSON.stringify([order]),
  });
  const insertedOrder = insertedOrders?.[0];

  if (!insertedOrder?.id) {
    throw new Error("建立訂單失敗，Supabase 未回傳訂單 ID");
  }

  if (items?.length) {
    await supabaseRequest("order_items", {
      method: "POST",
      body: JSON.stringify(
        items.map((item) => ({
          ...item,
          order_id: insertedOrder.id,
        }))
      ),
    });
  }

  await supabaseRequest("order_events", {
    method: "POST",
    body: JSON.stringify([
      {
        order_id: insertedOrder.id,
        event_type: "order_created",
        message: "訂單已建立，等待 ECPay 付款",
        raw_payload: { order_no: insertedOrder.order_no },
      },
    ]),
  });

  return insertedOrder;
}

export async function getOrderByOrderNo(orderNo) {
  const orders = await supabaseRequest(
    `orders?order_no=eq.${encodeURIComponent(orderNo)}&select=*&limit=1`,
    {
      method: "GET",
      headers: {
        Prefer: "",
      },
    }
  );

  return orders?.[0] || null;
}

export async function updateOrderByOrderNo(orderNo, values) {
  const updatedOrders = await supabaseRequest(
    `orders?order_no=eq.${encodeURIComponent(orderNo)}`,
    {
      method: "PATCH",
      body: JSON.stringify(values),
    }
  );

  return updatedOrders?.[0] || null;
}

export async function createOrderEvent({ orderId = null, eventType, message = "", rawPayload = {} }) {
  const insertedEvents = await supabaseRequest("order_events", {
    method: "POST",
    body: JSON.stringify([
      {
        order_id: orderId,
        event_type: eventType,
        message,
        raw_payload: rawPayload,
      },
    ]),
  });

  return insertedEvents?.[0] || null;
}

export async function listOrders({ limit = 50 } = {}) {
  return supabaseRequest(
    `orders?select=*,order_items(*)&order=created_at.desc&limit=${encodeURIComponent(limit)}`,
    {
      method: "GET",
      headers: {
        Prefer: "",
      },
    }
  );
}
