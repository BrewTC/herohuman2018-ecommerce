import { redirect } from "next/navigation";
import AdminLoginForm from "../../components/AdminLoginForm";
import { getAdminSession } from "../../lib/adminAuth";

export const metadata = {
  title: "後台登入 | 喜洛 HeroHuman",
};

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin/products");

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel">
        <div className="admin-login-brand">
          <span aria-hidden="true">喜洛</span>
          <div>
            <p>HeroHuman Admin</p>
            <h1>商店管理後台</h1>
          </div>
        </div>
        <p className="admin-login-copy">
          登入後可以新增商品、調整售價與內容，並管理商品的上架、售完及封存狀態。
        </p>
        <AdminLoginForm />
        <p className="admin-login-note">僅限已加入管理員名單的 Supabase Auth 帳號。</p>
      </section>
    </main>
  );
}
