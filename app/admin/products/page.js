import Link from "next/link";
import AdminShell from "../../components/AdminShell";
import { requireAdmin } from "../../lib/adminAuth";
import { isSupabaseConfigured, listAdminProducts } from "../../lib/supabaseAdmin";

export const metadata = {
  title: "商品管理 | 喜洛 HeroHuman",
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await requireAdmin();
  let products = [];
  let error = "";

  if (!isSupabaseConfigured()) {
    error = "尚未設定 Supabase 環境變數。";
  } else {
    try {
      products = await listAdminProducts();
    } catch (fetchError) {
      error = fetchError.message;
    }
  }

  return (
    <AdminShell user={user}>
      <section className="mx-auto max-w-6xl">
        <div className="admin-page-heading">
          <div>
            <p className="page-kicker">Products</p>
            <h1>商品管理</h1>
            <p>管理商店裡的商品內容、價格、排序與上架狀態。</p>
          </div>
          <Link href="/admin/products/new" className="admin-primary-link">
            <span aria-hidden="true">＋</span>
            新增商品
          </Link>
        </div>

        {error ? (
          <div className="admin-empty-state">
            <h2>目前無法讀取商品</h2>
            <p>{error}</p>
            <p>請先在 Supabase SQL Editor 執行 `supabase/sql/002_products.sql`。</p>
          </div>
        ) : products.length === 0 ? (
          <div className="admin-empty-state">
            <h2>還沒有商品</h2>
            <p>建立第一項商品後，就可以從這裡管理上架內容。</p>
            <Link href="/admin/products/new">新增第一項商品</Link>
          </div>
        ) : (
          <div className="admin-product-list">
            <div className="admin-product-list-header" aria-hidden="true">
              <span>商品</span>
              <span>售價</span>
              <span>狀態</span>
              <span>排序</span>
              <span>操作</span>
            </div>
            {products.map((product) => (
              <article key={product.id} className="admin-product-row">
                <div className="admin-product-identity">
                  <div className="admin-product-thumb">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" />
                    ) : (
                      <span>無圖</span>
                    )}
                  </div>
                  <div>
                    <h2>{product.name}</h2>
                    <p>{product.sku || product.slug}</p>
                  </div>
                </div>
                <strong className="admin-product-price">NT$ {product.price}</strong>
                <div className="admin-product-statuses">
                  <StatusBadge status={product.status} />
                  {product.isSoldOut && <span className="admin-status-badge sold-out">售完</span>}
                </div>
                <span className="admin-product-order">{product.sortOrder}</span>
                <Link href={`/admin/products/${product.id}`} className="admin-edit-link">
                  編輯
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}

function StatusBadge({ status }) {
  const labels = {
    draft: "草稿",
    active: "上架中",
    archived: "已封存",
  };

  return <span className={`admin-status-badge ${status}`}>{labels[status] || status}</span>;
}
