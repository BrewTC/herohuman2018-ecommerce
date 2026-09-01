import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";

export const metadata = {
  title: "品牌故事 | 喜洛 HeroHuman",
  description: "喜洛 HeroHuman 的品牌故事、烘焙理念、在地食材與食農教育服務。",
};

const milestones = [
  {
    title: "從大學時期的一個小念頭開始",
    text: "喜洛的起點，是大學時期慢慢萌芽的創業想像。\n我們學食品，也相信食品不只是好吃而已，它應該讓人安心、被照顧，並且在重要時刻留下記憶。",
  },
  {
    title: "從手工餅乾、禮盒到節慶預購",
    text: "一路從手工餅乾、春節禮盒，到後來穩定接單的中秋月餅禮盒，喜洛一直在烘焙現場裡打磨自己。\n即使雞蛋、麵粉、奶油等原料經歷多次波動，我們仍希望用穩定品質，把最原始的手作心意留下來。",
  },
  {
    title: "把烘焙帶進更多人的生活",
    text: "後來闆闆與闆娘陸續參與雲林縣青年諮詢事務委員會，也開始投入食農教育、樂齡烘焙課程與公益行動。\n每年聖誕節，我們都希望讓育幼院的孩子收到好吃的麵包與蛋糕，也謝謝每一位一起支持愛心活動的朋友。",
  },
];

const values = [
  "我替你把關！\n選這個比較健康。",
  "食品成分我幫你看過\n你可以放心。",
  "你喜歡吃，我特別留給你。",
  "外面下雨，記得帶傘。",
];

const services = [
  "烘焙產品與節慶禮盒",
  "食農教育、烘焙體驗與陶藝體驗",
  "食品創業與產品開發顧問",
  "包裝食品標示與升級服務",
  "食品業結合軟體工具的應用服務",
];

const localIngredients = ["元長蒜頭", "北港花生", "水林地瓜", "員林蜜餞", "大村葡萄"];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />
      <main className="content-page flex-1">
        <section className="about-hero px-4 py-12 sm:px-6 lg:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
            <div>
              <p className="page-kicker">Brand Story</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
                喜洛 HeroHuman
              </h1>
              <p className="about-lead mt-6">
                我們不是只想賣食品，我們想幫一個好產品走得更遠。
              </p>
              <p className="mt-5 max-w-2xl text-base leading-8">
                喜洛希望透過烘焙與日常飲食，傳遞一件很簡單、也很珍貴的事：<br></br>
                每個人都能成為別人生命中的英雄。<br></br>
                這裡的 Hero 不是超級英雄，而是那些在生活裡默默照顧、願意替他人多想一步的人。
              </p>
            </div>

            <div className="about-image-board" aria-label="喜洛烘焙商品">
              <div className="about-image-main">
                <Image src="/3pcs_mooncakes_800px_800px.jpg" alt="喜洛月餅禮盒" width={800} height={800} priority />
              </div>
              <div className="about-image-small">
                <Image src="/original_bagel_800px_800px.jpg" alt="喜洛原味貝果" width={800} height={800} />
              </div>
              <div className="about-image-small">
                <Image src="/6pcs_mooncakes_800px_800px.jpg" alt="喜洛六入月餅" width={800} height={800} />
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="about-section-heading">
              <p className="page-kicker">HeroHuman</p>
              <h2>在日常裡，用心呵護別人的人</h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value} className="about-quote-card">
                  {/* <p>{value}</p> */}
                  <p className="whitespace-pre-line">{value}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 max-w-3xl text-base leading-8">
              這些微小的提醒、準備與陪伴，其實就是一種溫柔的守護。<br></br>喜洛想成為一個能陪伴人們喜、怒、哀、樂的品牌：<br></br>當你需要甜點、需要一份禮、需要有人一起把生活過得更踏實時，我們希望喜洛是溫暖且可靠的存在。
            </p>
          </div>
        </section>

        <section className="about-story-band px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="about-section-heading">
              <p className="page-kicker">Our Journey</p>
              <h2>一路走來，我們都在學著把好味道留下來</h2>
            </div>

            <div className="mt-8 grid gap-5">
              {milestones.map((item, index) => (
                <article key={item.title} className="about-timeline-item">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{item.title}</h3>
                    {/* <p>{item.text}</p> */}
                    <p className="whitespace-pre-line">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="about-section-heading">
              <p className="page-kicker">What We Do</p>
              <h2>從烘焙出發<br></br>也陪食品人一起前進</h2>
              <p>
                這幾年，是喜洛持續自我探索的時刻。我們不只想讓喜歡喜洛的朋友吃到美味，也想用自己的食品專業、數位能力與地方連結，為更多好產品創造被看見的機會。
              </p>
            </div>

            <div className="about-service-grid">
              {services.map((service) => (
                <div key={service} className="about-service-card">
                  <span aria-hidden="true"></span>
                  <p>{service}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <div className="about-local-panel">
              <p className="page-kicker">Local Taste</p>
              <h2>把台灣土地的味道，放進日常</h2>
              <p>
                喜洛的品牌定位是親民、有溫度、有質感。我們喜歡台灣城鄉裡真實的人情味，也期待把地方農特產品轉化成更容易親近的日常風味。
              </p>
              <div className="about-tag-list">
                {localIngredients.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>

            <div className="about-founder-note">
              <p className="page-kicker">From Enya & Matt</p>
              <h2>我們是喜洛共同創辦人</h2>
              <p>
                每個好的產品，都值得被好好看見，也值得擁有轉型升級的可能。<br></br>如果你也認同喜洛的品牌理念，期待看見更多屬於食品人的故事，歡迎持續追蹤喜洛 HeroHuman。
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
