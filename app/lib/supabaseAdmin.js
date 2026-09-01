import "./loadServerEnv";

const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export async function supabaseRequest(path, options = {}) {
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

export function normalizeProduct(product) {
  if (!product) return null;

  return {
    id: product.id,
    legacyId: product.legacy_id ?? null,
    sku: product.sku || "",
    slug: product.slug || "",
    name: product.name || "",
    price: Number(product.price) || 0,
    imageUrl: product.image_url || "",
    summary: product.summary || "",
    description: product.description || "",
    highlights: Array.isArray(product.highlights) ? product.highlights : [],
    specs: Array.isArray(product.specs) ? product.specs : [],
    ingredients: product.ingredients || "",
    storage: product.storage || "",
    serving: product.serving || "",
    allergens: product.allergens || "",
    status: product.status || "draft",
    isSoldOut: Boolean(product.is_sold_out),
    sortOrder: Number(product.sort_order) || 0,
    createdAt: product.created_at || null,
    updatedAt: product.updated_at || null,
  };
}

export function serializeProduct(product) {
  return {
    sku: product.sku || null,
    slug: product.slug,
    name: product.name,
    price: Number(product.price),
    image_url: product.imageUrl || "",
    summary: product.summary || "",
    description: product.description || "",
    highlights: Array.isArray(product.highlights) ? product.highlights : [],
    specs: Array.isArray(product.specs) ? product.specs : [],
    ingredients: product.ingredients || "",
    storage: product.storage || "",
    serving: product.serving || "",
    allergens: product.allergens || "",
    status: product.status || "draft",
    is_sold_out: Boolean(product.isSoldOut),
    sort_order: Number(product.sortOrder) || 0,
  };
}

export async function listStorefrontProducts() {
  const products = await supabaseRequest(
    "products?status=eq.active&select=*&order=sort_order.asc,created_at.asc",
    {
      method: "GET",
      headers: { Prefer: "" },
    }
  );

  return (products || []).map(normalizeProduct);
}

export async function listAdminProducts() {
  const products = await supabaseRequest(
    "products?select=*&order=sort_order.asc,created_at.asc",
    {
      method: "GET",
      headers: { Prefer: "" },
    }
  );

  return (products || []).map(normalizeProduct);
}

export async function getProductById(id) {
  const products = await supabaseRequest(
    `products?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
    {
      method: "GET",
      headers: { Prefer: "" },
    }
  );

  return normalizeProduct(products?.[0]);
}

export async function createProduct(product) {
  const insertedProducts = await supabaseRequest("products", {
    method: "POST",
    body: JSON.stringify([serializeProduct(product)]),
  });

  return normalizeProduct(insertedProducts?.[0]);
}

export async function updateProduct(id, product) {
  const updatedProducts = await supabaseRequest(
    `products?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(serializeProduct(product)),
    }
  );

  return normalizeProduct(updatedProducts?.[0]);
}

export async function uploadProductImage({ bytes, contentType, fileName }) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase 尚未設定，無法上傳商品圖片");
  }

  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const objectPath = `${Date.now()}-${safeFileName}`;
  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/product-images/${encodedPath}`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": contentType,
        "x-upsert": "false",
      },
      body: bytes,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`商品圖片上傳失敗：${message || response.statusText}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/product-images/${encodedPath}`;
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
