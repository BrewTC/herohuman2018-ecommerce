"use client";

import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Carousel from "./components/Carousel";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Carousel /> {/* 在這裡顯示輪播元件 */}
      <main id="products" className="flex-1 px-2 py-4 sm:p-4">
        <ProductList searchQuery={searchQuery} />
      </main>
      <Cart />
      <Footer />
    </div>
  );
}
