import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { isSupabaseConfigured, listOrders } from "../../lib/supabaseAdmin";

export const metadata = {
  title: "訂單紀錄 | 喜洛烘焙商店",
};

export default async function AdminOrdersPage() {
  let orders = [];
  let error = "";

  if (!isSupabaseConfigured()) {
    error = "尚未設定 Supabase 環境變數，請先建立 .env.local。";
  } else {
    try {
      orders = await listOrders({ limit: 50 });
    } catch (fetchError) {
      error = fetchError.message;
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />
      <main className="content-page flex-1 px-4 py-10">
        <section className="mx-auto max-w-6xl">
          <p className="page-kicker">Admin</p>
          <h1 className="mt-2 text-3xl font-bold">訂單紀錄</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7">
            這是第一版本機管理頁，用來確認訂單是否成功寫入 Supabase。正式部署前請務必加入後台登入或權限保護。
          </p>

          {error ? (
            <div className="info-panel mt-6 p-5">
              <h2 className="text-lg font-bold">目前無法讀取訂單</h2>
              <p className="mt-2 text-sm leading-7" style={{ color: "#a32d2d" }}>
                {error}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {orders.length === 0 ? (
                <div className="info-panel p-5">
                  <p>目前還沒有訂單。</p>
                </div>
              ) : (
                orders.map((order) => (
                  <article key={order.id} className="admin-order-card">
                    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between" style={{ borderColor: "var(--border-soft)" }}>
                      <div>
                        <h2 className="text-lg font-bold">訂單 {order.order_no}</h2>
                        <p className="text-sm">
                          {orderTypeLabel(order.order_type)} · {formatDate(order.created_at)} · {order.customer_name} · {order.phone}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge label={`付款：${paymentStatusLabel(order.payment_status)}`} />
                        <StatusBadge label={`出貨：${fulfillmentStatusLabel(order.fulfillment_status)}`} />
                      </div>
                    </div>

                    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                      <div className="overflow-x-auto">
                        <table className="admin-order-table">
                          <thead>
                            <tr>
                              <th>品項</th>
                              <th>單價</th>
                              <th>數量</th>
                              <th>小計</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.order_items || []).map((item) => (
                              <tr key={item.id}>
                                <td>{item.item_name}</td>
                                <td>NT$ {item.unit_price}</td>
                                <td>{item.quantity}</td>
                                <td>NT$ {item.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <aside className="admin-order-summary">
                        <p>
                          <strong>Email</strong>
                          <span>{order.email}</span>
                        </p>
                        <p>
                          <strong>地址</strong>
                          <span>{order.address || "未提供"}</span>
                        </p>
                        <p>
                          <strong>總金額</strong>
                          <span>NT$ {order.total_amount}</span>
                        </p>
                        <p>
                          <strong>ECPay 交易編號</strong>
                          <span>{order.ecpay_trade_no || "尚未回傳"}</span>
                        </p>
                        <p>
                          <strong>付款時間</strong>
                          <span>{order.paid_at ? formatDate(order.paid_at) : "尚未付款"}</span>
                        </p>
                      </aside>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function StatusBadge({ label }) {
  return (
    <span className="admin-status-badge">
      {label}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function paymentStatusLabel(status) {
  const labels = {
    pending_payment: "待付款",
    paid: "已付款",
    failed: "付款失敗",
    cancelled: "已取消",
    refunded: "已退款",
  };

  return labels[status] || status;
}

function orderTypeLabel(type) {
  const labels = {
    product: "商品訂單",
    experience: "課程報名",
  };

  return labels[type] || type;
}

function fulfillmentStatusLabel(status) {
  const labels = {
    unfulfilled: "未出貨",
    preparing: "準備中",
    shipped: "已出貨",
    ready_for_pickup: "可取貨",
    completed: "已完成",
    returned: "已退貨",
    cancelled: "已取消",
  };

  return labels[status] || status;
}
