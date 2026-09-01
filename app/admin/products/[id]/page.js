import { notFound } from "next/navigation";
import AdminProductForm from "../../../components/AdminProductForm";
import AdminShell from "../../../components/AdminShell";
import { requireAdmin } from "../../../lib/adminAuth";
import { getProductById } from "../../../lib/supabaseAdmin";

export const metadata = {
  title: "編輯商品 | 喜洛 HeroHuman",
};

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const user = await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id).catch(() => null);

  if (!product) notFound();

  return (
    <AdminShell user={user}>
      <section className="mx-auto max-w-6xl">
        <div className="admin-page-heading compact">
          <div>
            <p className="page-kicker">Edit Product</p>
            <h1>編輯商品</h1>
            <p>修改後儲存，前台會依商品狀態顯示最新內容。</p>
          </div>
        </div>
        <AdminProductForm product={product} />
      </section>
    </AdminShell>
  );
}
