"use client";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { products as initialProducts } from "../data/products";
import ProductModal from "./ProductModal";

export default function ProductList({ searchQuery = "" }) {
  const { addToCart } = useCart(); // 使用購物車功能
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState(initialProducts);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;

        const result = await response.json();
        if (Array.isArray(result.products)) {
          setProducts(result.products);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("商品資料更新失敗，保留目前顯示內容");
        }
      }
    };

    loadProducts();
    return () => controller.abort();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (!normalizedQuery) return true;

    const searchableText = [
      product.name,
      product.summary,
      product.description,
      product.ingredients,
      product.storage,
      product.serving,
      product.allergens,
      ...product.highlights,
      ...product.specs,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  const handleProductKeyDown = (event, product) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedProduct(product);
    }
  };

  return (
    <div className="px-3 py-4 sm:p-4">
      <div className="product-shipping-notice mx-auto mb-4 max-w-3xl px-4 py-3 text-center text-sm font-bold sm:text-base">
        <span>喜洛9月份陸續進行月餅訂單製作</span>
        <span>中秋月餅預計發貨時間：9/19(六)～9/21(一）</span>
      </div>

      <h2 className="text-xl font-bold mb-4 text-center">精選商品</h2>

      {normalizedQuery && (
        <p className="mb-4 text-center text-sm" style={{ color: "var(--text-sub)" }}>
          搜尋「{searchQuery}」找到 {filteredProducts.length} 項商品
        </p>
      )}

      {filteredProducts.length === 0 ? (
        <div className="empty-products mx-auto max-w-md px-4 py-10 text-center">
          <h3 className="text-lg font-bold">找不到符合的商品</h3>
          <p className="mt-2 text-sm" style={{ color: "var(--text-sub)" }}>
            可以試試「貝果」、「月餅」、「蛋塔」或其他關鍵字。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="product-item flex flex-col p-2.5 sm:p-4 text-center"
          >
            <div
              className="product-image mb-1.5 aspect-square cursor-pointer overflow-hidden rounded-xl bg-[#fafafa]"
              role="button"
              tabIndex={0}
              aria-label={`查看 ${product.name} 詳細說明`}
              onClick={() => setSelectedProduct(product)}
              onKeyDown={(event) => handleProductKeyDown(event, product)}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="product-card-title text-sm sm:text-base font-semibold line-clamp-2">
              {product.name}
            </h3>
            <p className="product-card-price text-sm sm:text-base" style={{ color: "var(--text-sub)" }}>
              ${product.price}
            </p>
            <p className="product-card-summary line-clamp-2 text-xs sm:text-sm" style={{ color: "var(--text-sub)" }}>
              {product.summary}
            </p>
            <button
              type="button"
              onClick={() => addToCart(product)}
              disabled={product.isSoldOut}
              className="btn-primary product-cart-button mt-auto w-full py-1.5 px-3 text-sm sm:text-base"
            >
              {product.isSoldOut ? "目前售完" : "加入購物車"}
            </button>
          </div>
          ))}
        </div>
      )}

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
}
