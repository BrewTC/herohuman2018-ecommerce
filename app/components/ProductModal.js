"use client";

import { useEffect } from "react";

export default function ProductModal({ product, onClose, onAddToCart }) {
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="product-modal-backdrop fixed inset-0 z-[60] flex items-end justify-center bg-black/40 px-3 py-4 sm:items-center"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="product-modal-panel w-full max-w-3xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6" style={{ borderColor: "var(--border-soft)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-sub)" }}>
              商品詳情
            </p>
            <h2 id="product-modal-title" className="text-lg font-bold sm:text-2xl">
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉商品詳情"
            className="modal-close-button flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <div className="aspect-square overflow-hidden rounded-2xl bg-[#fafafa]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <p className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
                ${product.price}
              </p>
              <p className="mt-2 text-base" style={{ color: "var(--text-sub)" }}>
                {product.summary}
              </p>
              <p className="mt-4 text-sm leading-7 sm:text-base" style={{ color: "var(--text-main)" }}>
                {product.description}
              </p>

              <div className="mt-5">
                <h3 className="text-sm font-bold">商品特色</h3>
                <ul className="mt-2 grid gap-2">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="product-modal-list-item text-sm">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl p-4" style={{ backgroundColor: "var(--bg-main)" }}>
                <InfoRow title="商品規格" value={product.specs.join(" / ")} />
                <InfoRow title="主要成分" value={product.ingredients} />
                <InfoRow title="保存方式" value={product.storage} />
                <InfoRow title="建議食用" value={product.serving} />
                <InfoRow title="過敏原提醒" value={product.allergens} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary py-2.5"
                >
                  繼續逛逛
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="btn-primary py-2.5"
                >
                  加入購物車
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ title, value }) {
  return (
    <div>
      <h4 className="text-xs font-bold" style={{ color: "var(--text-main)" }}>
        {title}
      </h4>
      <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-sub)" }}>
        {value}
      </p>
    </div>
  );
}
