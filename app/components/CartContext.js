"use client";
import { createContext, useEffect, useRef, useState, useContext } from "react";

// 建立購物車 Context
const CartContext = createContext();

// 提供購物車 Context
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartNotice, setCartNotice] = useState(null);
  const noticeTimerRef = useRef(null);

  // 加入購物車
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    setCartNotice({
      id: Date.now(),
      productName: product.name,
    });
  };

  useEffect(() => {
    if (!cartNotice) return undefined;

    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = setTimeout(() => {
      setCartNotice(null);
    }, 800);

    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, [cartNotice]);

  // 移除購物車商品
  function removeFromCart(product) {
    setCart((currentCart) => {
      return currentCart.map((item) =>
        item.id === product.id ? { ...item, quantity: Math.max(item.quantity - 1, 0) } : item
      ).filter(item => item.quantity > 0); // 移除數量變 0 的商品
    });
  }
  
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
      <CartToast notice={cartNotice} />
    </CartContext.Provider>
  );
}

// 自訂 Hook 方便使用購物車
export function useCart() {
  return useContext(CartContext);
}

function CartToast({ notice }) {
  if (!notice) return null;

  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <span aria-hidden="true">✓</span>
      <p>
        已加入購物車
        <strong>{notice.productName}</strong>
      </p>
    </div>
  );
}
