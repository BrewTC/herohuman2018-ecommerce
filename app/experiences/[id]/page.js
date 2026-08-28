import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ExperienceRegistrationForm from "../../components/experiences/ExperienceRegistrationForm";
import { experiences, getExperienceById } from "../../data/experiences";

export async function generateStaticParams() {
  return experiences.map((experience) => ({
    id: experience.id,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const experience = getExperienceById(id);

  if (!experience) {
    return {
      title: "找不到課程 | 喜洛烘焙商店",
    };
  }

  return {
    title: `${experience.subtitle} | 喜洛烘焙商店`,
  };
}

export default async function ExperienceDetailPage({ params }) {
  const { id } = await params;
  const experience = getExperienceById(id);

  if (!experience) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />
      <main className="content-page flex-1 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/experiences" className="back-link-button">
            <span aria-hidden="true">←</span>
            返回食農教育體驗
          </Link>

          <section className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <article>
              <div className="experience-hero-image overflow-hidden">
                <img src={experience.imageUrl} alt={experience.title} />
              </div>

              <div className="mt-6">
                <p className="page-kicker">Farm To Table</p>
                <h1 className="mt-2 text-3xl font-bold">{experience.title}</h1>
                <p className="mt-2 text-xl font-semibold" style={{ color: "var(--text-main)" }}>
                  {experience.subtitle}
                </p>
                <p className="mt-4 text-base leading-8">
                  {experience.description}
                </p>
              </div>

              <dl className="experience-detail-meta mt-6 grid gap-3 sm:grid-cols-2">
                <InfoBlock title="費用" value={`NT$ ${experience.price} / 人`} />
                <InfoBlock title="課程時間" value={experience.duration} />
                <InfoBlock title="地點" value={experience.location} />
                <InfoBlock title="適合對象" value={experience.targetAge} />
              </dl>

              <section className="info-panel mt-6 p-5">
                <h2 className="text-xl font-bold">課程流程</h2>
                <ol className="mt-4 grid gap-3">
                  {experience.flow.map((step, index) => (
                    <li key={step} className="experience-step">
                      <span>{index + 1}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="info-panel p-5">
                  <h2 className="text-lg font-bold">費用包含</h2>
                  <ul className="mt-3 grid gap-2">
                    {experience.includes.map((item) => (
                      <li key={item} className="product-modal-list-item text-sm">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="info-panel p-5">
                  <h2 className="text-lg font-bold">注意事項</h2>
                  <ul className="mt-3 grid gap-2">
                    {experience.notes.map((note) => (
                      <li key={note} className="product-modal-list-item text-sm">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </article>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <ExperienceRegistrationForm experience={experience} />
            </aside>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoBlock({ title, value }) {
  return (
    <div className="info-panel p-4">
      <dt className="text-sm font-bold">{title}</dt>
      <dd className="mt-1 text-sm leading-7" style={{ color: "var(--text-sub)" }}>
        {value}
      </dd>
    </div>
  );
}
