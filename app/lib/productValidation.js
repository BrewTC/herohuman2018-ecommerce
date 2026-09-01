const PRODUCT_STATUSES = new Set(["draft", "active", "archived"]);

function cleanText(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function cleanList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item, 160))
    .filter(Boolean)
    .slice(0, 20);
}

export function validateProductInput(input) {
  const name = cleanText(input.name, 120);
  const sku = cleanText(input.sku, 60) || null;
  const slugValue = cleanText(input.slug, 120).toLowerCase();
  const slug = slugValue || `product-${Date.now()}`;
  const price = Number(input.price);
  const sortOrder = Number(input.sortOrder);
  const status = PRODUCT_STATUSES.has(input.status) ? input.status : "draft";

  if (!name) throw new Error("請填寫商品名稱");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("商品網址代碼只能使用小寫英文、數字與連字號");
  }
  if (!Number.isInteger(price) || price < 0 || price > 1000000) {
    throw new Error("商品價格必須是 0 到 1,000,000 之間的整數");
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999999) {
    throw new Error("排序必須是 0 到 999999 之間的整數");
  }

  const product = {
    name,
    sku,
    slug,
    price,
    imageUrl: cleanText(input.imageUrl, 1000),
    summary: cleanText(input.summary, 500),
    description: cleanText(input.description, 5000),
    highlights: cleanList(input.highlights),
    specs: cleanList(input.specs),
    ingredients: cleanText(input.ingredients, 3000),
    storage: cleanText(input.storage, 2000),
    serving: cleanText(input.serving, 2000),
    allergens: cleanText(input.allergens, 2000),
    status,
    isSoldOut: Boolean(input.isSoldOut),
    sortOrder,
  };

  if (status === "active" && !product.imageUrl) {
    throw new Error("商品上架前請先設定商品主圖");
  }

  return product;
}
