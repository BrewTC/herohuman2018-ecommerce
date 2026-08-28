"use client";
import { useState } from "react";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation"; // 用於跳轉頁面

export default function Cart() {
  const { cart, addToCart, removeFromCart } = useCart();
  const router = useRouter(); // 取得 router 物件
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* 浮動購物車按鈕：固定在右下角，預設收合，不擋畫面 */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="開啟購物車"
        className="cart-fab fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-md"
        style={{ backgroundColor: "var(--bg-soft)", border: "1px solid var(--border-soft)" }}
      >
        <span className="text-xl" aria-hidden="true">🛒</span>
        {itemCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-xs font-semibold flex items-center justify-center text-white"
            style={{ backgroundColor: "#d4537e" }}
          >
            {itemCount}
          </span>
        )}
      </button>

      {/* 背景遮罩：點擊可收合 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 購物車面板：展開時從右側滑出，可滾動查看所有商品 */}
      <div
        className={`cart-panel fixed top-0 right-0 z-50 h-full w-full max-w-sm flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <h2 className="text-lg font-bold">購物車（{itemCount}）</h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="關閉購物車"
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: "var(--bg-main)" }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p style={{ color: "var(--text-sub)" }}>購物車是空的</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center pb-3 border-b"
                  style={{ borderColor: "var(--border-soft)" }}
                >
                  <div className="min-w-0 mr-2">
                    <h3 className="text-sm font-medium truncate">{item.name}</h3>
                    <p className="text-sm" style={{ color: "var(--text-sub)" }}>
                      ${item.price} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(item)}
                      aria-label="減少數量"
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: "#d4537e" }}
                    >
                      −
                    </button>
                    <span className="w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      aria-label="增加數量"
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "var(--accent-mint)", color: "var(--text-main)" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t" style={{ borderColor: "var(--border-soft)" }}>
            <div className="flex justify-between items-center mb-3 font-bold">
              <span>總金額</span>
              <span>${totalPrice}</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/checkout");
              }}
              className="btn-primary w-full py-2.5"
            >
              前往結帳
            </button>
          </div>
        )}
      </div>
    </>
  );
}
