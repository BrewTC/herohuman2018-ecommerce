import Link from "next/link";
import AdminLogoutButton from "./AdminLogoutButton";

export default function AdminShell({ user, children }) {
  return (
    <div className="admin-shell min-h-screen">
      <header className="admin-header">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link href="/admin/products" className="admin-brand-link">
              喜洛 HeroHuman
            </Link>
            <p>商品與訂單管理</p>
          </div>
          <div className="admin-account">
            <span>{user.email}</span>
            <AdminLogoutButton />
          </div>
        </div>
        <nav className="admin-nav" aria-label="後台導覽">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 sm:px-6">
            <Link href="/admin/products">商品管理</Link>
            <Link href="/admin/orders">訂單紀錄</Link>
            <Link href="/" target="_blank">查看商店</Link>
          </div>
        </nav>
      </header>
      <main className="admin-main px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
