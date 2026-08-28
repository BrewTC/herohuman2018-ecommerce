import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "會員專區 | 喜洛烘焙商店",
};

export default function MembersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />
      <main className="content-page flex-1 px-4 py-10">
        <section className="mx-auto max-w-3xl">
          <p className="page-kicker">Member</p>
          <h1 className="text-3xl font-bold">會員專區</h1>
          <p className="mt-4 text-base leading-8">
            喜洛會員系統目前仍在規劃中，暫時還沒有開放登入、註冊與會員功能。
          </p>

          <div className="info-panel mt-8 p-5">
            <h2 className="text-lg font-bold">目前暫未開放會員專區</h2>
            <p className="mt-2 text-sm leading-7">
              後續若開放會員登入、訂單查詢、會員優惠或活動通知，我們會再於網站與社群公告。現階段若有訂單或商品問題，歡迎透過頁尾的電話、Email 或 LINE 與我們聯繫。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
