"use client";
import { useCart } from "./CartContext";

const products = [
  { id: 1, name: "原味貝果", price: 45, imageUrl: "/original_bagel_800px_800px.jpg" },
  { id: 2, name: "可可貝果", price: 65, imageUrl: "/chocolate_Bagel_800px_800px.jpg" },
  { id: 3, name: "3入月餅", price: 250, imageUrl: "/3pcs_mooncakes_800px_800px.jpg" },
  { id: 4, name: "6入月餅", price: 450, imageUrl: "/6pcs_mooncakes_800px_800px.jpg" },
  { id: 5, name: "千層蛋塔 經典原味(4入一盒)", price: 220, imageUrl: "https://shoplineimg.com/62d43627545586001513ac71/66fa60182e32e300101e57d9/375x.webp?source_format=png" },
  // 添加更多產品
];

export default function ProductList() {
  const { addToCart } = useCart(); // 使用購物車功能

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-center">精選商品</h2>

      {/* 產品區域 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="product-item border p-4 rounded-lg shadow flex flex-col items-center text-center">
            <div className="product-image mb-2"> {/* 減少圖片下方的間距 */}
              <img src={product.imageUrl} alt={product.name} className="w-full h-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{product.name}</h3> {/* 減少商品名稱下方的間距 */}
            <p className="text-gray-600 mb-2">${product.price}</p> {/* 減少價格下方的間距 */}
            <button
              onClick={() => addToCart(product)}
              className="mt-2 bg-blue-600 text-white py-1 px-3 rounded"
            >
              加入購物車
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
