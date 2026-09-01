"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Carousel from "./components/Carousel";

const foodApps = [
  {
    name: "NutriTag",
    label: "食品營養標示計算工具",
    href: "https://nutri-tag.com/",
    logo: "/nutritag-logo.png",
    summary: "協助食品品牌把配方、營養資訊與標示版面整理得更清楚，適合包裝食品開發前期使用。",
  },
  {
    name: "Baking Timer",
    label: "烘焙發酵助手",
    href: "https://mattdataadventures.github.io/baking-timer/",
    logo: "/baking-timer-logo.jpg",
    summary: "為烘焙工作者設計的流程時間工具，幫助管理發酵、等待與製程節點，讓日常製作更穩定。",
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Carousel /> {/* 在這裡顯示輪播元件 */}
      <main id="products" className="flex-1 px-2 py-4 sm:p-4">
        <ProductList searchQuery={searchQuery} />
      </main>
      <section className="home-apps-section px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(390px,0.9fr)_minmax(0,1.2fr)] lg:items-center">
          <div className="home-apps-copy">
            <p className="page-kicker">Food Tech Tools</p>
            <h1>食品人的實用工具箱</h1>
            <p>
              喜洛不只做烘焙，也希望把食品專業轉化成更容易上手的數位工具，陪小型品牌、食品創業者與烘焙工作者，把配方、標示與製程節奏整理得更清楚。
            </p>
            <Link href="/apps" className="home-apps-more-link">
              查看更多工具介紹
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="home-apps-card-grid">
            {foodApps.map((app) => (
              <article key={app.name} className="home-app-card">
                <div className="home-app-heading">
                  {app.logo && (
                    <img src={app.logo} alt={`${app.name} logo`} className="home-app-logo" />
                  )}
                  <div className="home-app-title-copy">
                    <span>{app.name}</span>
                    <h2>{app.label}</h2>
                  </div>
                </div>
                <p>{app.summary}</p>
                <a href={app.href} target="_blank" rel="noreferrer">
                  前往使用
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Cart />
      <Footer />
    </div>
  );
}
