import AdminProductForm from "../../../components/AdminProductForm";
import AdminShell from "../../../components/AdminShell";
import { requireAdmin } from "../../../lib/adminAuth";

export const metadata = {
  title: "新增商品 | 喜洛 HeroHuman",
};

export default async function NewProductPage() {
  const user = await requireAdmin();

  return (
    <AdminShell user={user}>
      <section className="mx-auto max-w-6xl">
        <div className="admin-page-heading compact">
          <div>
            <p className="page-kicker">New Product</p>
            <h1>新增商品</h1>
            <p>先以草稿儲存也沒問題，內容確認完成後再切換為上架。</p>
          </div>
        </div>
        <AdminProductForm />
      </section>
    </AdminShell>
  );
}
