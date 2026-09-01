import "./loadServerEnv";
import { products as fallbackProducts } from "../data/products";
import { isSupabaseConfigured, listStorefrontProducts } from "./supabaseAdmin";

export async function getStorefrontProducts({ allowFallback = true } = {}) {
  if (isSupabaseConfigured()) {
    try {
      const products = await listStorefrontProducts();
      return { products, source: "supabase" };
    } catch (error) {
      if (!allowFallback) throw error;
      console.warn("商品資料庫尚未就緒，暫時使用本機商品資料：", error.message);
    }
  }

  return {
    products: fallbackProducts.map((product, index) => ({
      ...product,
      legacyId: product.id,
      status: "active",
      isSoldOut: false,
      sortOrder: (index + 1) * 10,
    })),
    source: "local",
  };
}

export async function resolveCheckoutProducts(items) {
  const { products, source } = await getStorefrontProducts({ allowFallback: true });
  const productMap = new Map();

  products.forEach((product) => {
    productMap.set(String(product.id), product);
    if (product.legacyId !== null && product.legacyId !== undefined) {
      productMap.set(String(product.legacyId), product);
    }
  });

  const resolvedItems = items.map((item) => {
    const product = productMap.get(String(item.id));

    if (!product || product.status !== "active") {
      throw new Error("部分商品已下架，請重新整理購物車");
    }

    if (product.isSoldOut) {
      throw new Error(`${product.name} 已售完，請從購物車移除`);
    }

    const quantity = Math.round(Number(item.quantity));
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      throw new Error(`${product.name} 的訂購數量不正確`);
    }

    return {
      product,
      quantity,
      subtotal: product.price * quantity,
    };
  });

  return { items: resolvedItems, source };
}
