'use client';

import { useCart } from '../components/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Footer from '../components/Footer';

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // ===== 新增：資料清洗 =====
  const sanitizeText = (text) => {
    if (!text) return '';
    return text
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\-]/g, '') // 移除特殊符號
      .trim();
  };

  const limitLength = (text, max = 200) => {
    if (!text) return '';
    return text.slice(0, max);
  };

  // 計算總金額
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // 表單輸入
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {

    // ===== 原本驗證 =====
    if (!formData.name.trim()) {
      setError('請填寫姓名');
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('請填寫有效的電子郵件');
      return;
    }

    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) {
      setError('請填寫有效的電話號碼（10 位數字）');
      return;
    }

    if (totalPrice <= 0) {
      setError('購物車總金額無效，請確認您的購物車');
      return;
    }

    // ===== 新增：欄位長度限制 =====
    if (formData.address.length > 200) {
      setError('地址過長（限制200字）');
      return;
    }

    // ===== 新增：清洗資料 =====
    const cleanName = limitLength(sanitizeText(formData.name), 50);
    const cleanAddress = limitLength(sanitizeText(formData.address), 200);

    setLoading(true);
    setError(null);

    console.log('使用者提交的資料:', {
      name: cleanName,
      email: formData.email,
      phone: formData.phone,
      address: cleanAddress,
      totalPrice: totalPrice,
      cartItems: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    try {

      console.log('發送至 /api/ecpay 的資料:', {
        expectedAmount: totalPrice,
        name: cleanName,
        email: formData.email,
        phone: formData.phone,
        address: cleanAddress,
      });

      const response = await fetch('/api/ecpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          expectedAmount: totalPrice,
          name: cleanName,
          email: formData.email,
          phone: formData.phone,
          address: cleanAddress,
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      console.log('API 回應狀態:', {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API 錯誤訊息:', errorData);
        throw new Error(errorData.message || '結帳失敗，請再試一次');
      }

      const html = await response.text();

      console.log('接收到的 HTML（前 200 字元）:', html.substring(0, 200));

      const newWindow = window.open('', '_self');

      if (!newWindow) {
        throw new Error('無法開啟新窗口，可能是瀏覽器阻擋');
      }

      newWindow.document.write(html);

    } catch (error) {

      console.error('結帳錯誤:', error);
      setError(error.message);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="container mx-auto max-w-lg flex-1 p-4">
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-main)" }}>結帳</h2>

        {cart.length === 0 ? (
          <p style={{ color: "var(--text-sub)" }}>您的購物車是空的</p>
        ) : (
          <div>

            {/* 客戶資訊 */}
            <div className="checkout-card p-4 mb-4">
              <h3 className="text-lg font-semibold mb-3">客戶資訊</h3>

              <div className="grid gap-3">

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="姓名"
                  className="w-full"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="電子郵件"
                  className="w-full"
                />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="電話號碼 (例如 0912345678)"
                  className="w-full"
                />

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="住址（選填）"
                  className="w-full"
                />

              </div>
            </div>

            {/* 訂單明細 */}
            <div className="checkout-card p-4 mb-4">
              <h3 className="text-lg font-semibold mb-3">訂單明細</h3>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b"
                  style={{ borderColor: "var(--border-soft)" }}
                >
                  <h3 className="text-sm">{item.name}</h3>
                  <p style={{ color: "var(--text-sub)" }}>${item.price} x {item.quantity}</p>
                </div>
              ))}

              <div className="text-right font-bold text-lg mt-3">
                總金額：${totalPrice}
              </div>
            </div>

            <button
              onClick={handlePayment}
              className="btn-primary w-full py-2.5 disabled:opacity-40"
              disabled={loading || totalPrice === 0 || cart.length === 0}
            >
              {loading ? '處理中...' : '確認結帳'}
            </button>

            {error && (
              <p className="mt-2" style={{ color: "#a32d2d" }}>{error}</p>
            )}

            <button
              onClick={() => router.back()}
              className="btn-secondary mt-2 w-full py-2.5"
            >
              返回購物車
            </button>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
