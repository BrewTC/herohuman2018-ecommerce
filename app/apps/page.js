import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "食品人工具 | 喜洛 HeroHuman",
  description: "喜洛 HeroHuman 整理食品人可使用的數位工具，包含營養標示試算與烘焙發酵輔助。",
};

const apps = [
  {
    name: "NutriTag",
    eyebrow: "食品營養標示計算工具",
    href: "https://nutri-tag.com/",
    logo: "/nutritag-logo.png",
    summary:
      "給台灣食品業者使用的營養標示試算工具，協助依照配方比例快速整理營養資訊，也能預覽標示版面。",
    points: ["配方比例試算", "營養標示預覽", "包裝食品開發前置整理"],
  },
  {
    name: "Baking Timer",
    eyebrow: "烘焙發酵助手",
    href: "https://mattdataadventures.github.io/baking-timer/",
    logo: "/baking-timer-logo.jpg",
    summary:
      "為烘焙現場設計的時間輔助工具，適合用來管理發酵、等待與製程節點，讓小量製作也能保有穩定節奏。",
    points: ["發酵時間管理", "烘焙流程提醒", "小型工作室日常輔助"],
  },
];

const useCases = [
  "剛開始販售包裝食品，需要先整理配方、成本與標示資訊。",
  "工作室或小型品牌想把手作流程變得更穩定、更容易複製。",
  "食品人想用簡單工具降低行政整理時間，把心力留給產品本身。",
];

const serviceTags = [
  {
    title: "營養標示工具",
    text: "配方試算、營養標示整理與版面預覽。",
  },
  {
    title: "發酵計時工具",
    text: "協助管理烘焙製程中的等待與提醒節點。",
  },
  {
    title: "產品開發服務",
    text: "協助產品定位、配方設計、試作優化與量產前評估。",
  },
  {
    title: "顧問輔導服務",
    text: "提供食品技術、製程優化、原料使用與品質問題諮詢。",
  },
];

export default function AppsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />
      <main className="content-page flex-1">
        <section className="apps-hero px-4 py-12 sm:px-6 lg:py-16">
          <div className="mx-auto grid max-w-6xl gap-8">
            <div className="apps-hero-copy">
              <p className="page-kicker">Food Tech Tools</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
                食品人的實用工具箱
              </h1>
              <p className="apps-lead mt-6">
                喜洛不只做烘焙，也希望把食品專業與數位工具結合，陪更多食品人把好產品整理得更清楚、做得更穩定。
              </p>
            </div>

            <div className="apps-side-note">
              <div className="apps-side-note-header">
                <span aria-hidden="true">工具</span>
                <div>
                  <p>食品人的工具與服務</p>
                  <h2>工具與服務導覽</h2>
                  <p className="apps-side-note-intro">
                    從日常使用的數位工具，到產品開發與技術陪跑，依照你現在的需求找到合適的協助。
                  </p>
                </div>
              </div>

              <div className="apps-service-tag-grid">
                {serviceTags.map((tag, index) => (
                  <div key={tag.title} className="apps-service-tag">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{tag.title}</strong>
                      <p>{tag.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="apps-consult-row">
                <div className="apps-consult-copy">
                  <span className="apps-consult-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>
                  </span>
                  <div>
                    <strong>有產品或技術上的想法嗎？</strong>
                    <p>產品開發、配方調整、製程優化與顧問需求，都歡迎先來信和我們聊聊。</p>
                  </div>
                </div>
                <div className="apps-consult-action">
                  <span>點擊信箱與我們聊聊</span>
                  <a href="mailto:nutritag.ai@gmail.com" className="apps-consult-link">
                    nutritag.ai@gmail.com
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="about-section-heading">
              <p className="page-kicker">Our Apps</p>
              <h2>目前提供的食品人應用</h2>
              <p>
                這些工具是喜洛在食品開發、標示整理與烘焙流程裡延伸出來的應用，希望讓小型品牌、食品創業者與烘焙工作者少一點摸索，多一點安心。
              </p>
            </div>

            <div className="apps-grid mt-8">
              {apps.map((app) => (
                <article key={app.name} className="app-tool-card">
                  <div className="app-tool-heading">
                    {app.logo && (
                      <img src={app.logo} alt={`${app.name} logo`} className="app-tool-logo" />
                    )}
                    <div className="app-tool-title-copy">
                      <p>{app.name}</p>
                      <h3>{app.eyebrow}</h3>
                    </div>
                  </div>
                  <p>{app.summary}</p>
                  <ul>
                    {app.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <a href={app.href} target="_blank" rel="noreferrer">
                    前往使用
                    <span aria-hidden="true">→</span>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="apps-use-band px-4 py-12 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="about-section-heading">
              <p className="page-kicker">For Food Makers</p>
              <h2>適合正在把產品變成品牌的你</h2>
            </div>

            <div className="apps-use-list">
              {useCases.map((item, index) => (
                <div key={item} className="apps-use-item">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
