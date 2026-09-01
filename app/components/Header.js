"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "主頁", href: "/" },
  { label: "線上商城", href: "/#products" },
  { label: "食農教育體驗", href: "/experiences" },
  { label: "食品人工具", href: "/apps" },
  { label: "會員專區", href: "/members" },
  { label: "關於喜洛", href: "/about" },
];

export default function Header({ searchQuery = "", onSearchChange, showSearch = true }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="site-header sticky top-0 z-[1000]">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="開啟導覽選單"
          aria-expanded={isMenuOpen}
          className="header-icon-button flex h-10 w-10 shrink-0 items-center justify-center"
        >
          <span aria-hidden="true" className="hamburger-lines">
            <span />
            <span />
            <span />
          </span>
        </button>

        {showSearch && (
          <div className={`header-search-control ${isSearchOpen ? "is-open" : ""}`}>
            <button
              type="button"
              onClick={() => setIsSearchOpen((current) => !current)}
              aria-label={isSearchOpen ? "收合搜尋商品" : "開啟搜尋商品"}
              aria-expanded={isSearchOpen}
              className="header-icon-button flex h-10 w-10 shrink-0 items-center justify-center"
            >
              <span aria-hidden="true" className="search-icon">⌕</span>
            </button>

            {isSearchOpen && (
              <div className="header-search flex min-w-0 items-center">
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => onSearchChange?.(event.target.value)}
                  placeholder="搜尋商品"
                  aria-label="搜尋商品"
                  className="w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange?.("")}
                    aria-label="清除搜尋"
                    className="search-clear-button flex h-7 w-7 shrink-0 items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <Link href="/" className="brand-link min-w-0 shrink-0">
          <span className="block text-xs font-semibold">HeroHuman2018</span>
          <span className="block text-lg font-bold leading-tight sm:text-xl">喜洛 HeroHuman</span>
        </Link>
      </div>

      {isMenuOpen && (
        <div className="fixed left-0 top-0 z-[1100] h-screen w-screen">
          <div
            className="absolute inset-0 bg-black/30"
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
          />
          <nav
            className="side-nav relative z-[1101] flex min-h-screen w-[82vw] max-w-xs flex-col"
            aria-label="主要導覽"
          >
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border-soft)" }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-sub)" }}>MENU</p>
                <h2 className="text-xl font-bold">喜洛 HeroHuman</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="關閉導覽選單"
                className="modal-close-button flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              {navItems.map((item) => (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="side-nav-link block rounded-xl px-4 py-3 text-base font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
