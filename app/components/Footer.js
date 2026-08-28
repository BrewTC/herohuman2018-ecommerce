import Link from "next/link";

const contactItems = [
  {
    value: "台灣彰化縣員林市南東里浮圳路一段205號2F",
    icon: "pin",
  },
  {
    value: "週末 9 AM - 10 PM",
    icon: "clock",
  },
  {
    value: "0919-487-309",
    href: "tel:0919487309",
    icon: "phone",
  },
  {
    value: "herohuman2018@gmail.com",
    href: "mailto:herohuman2018@gmail.com",
    icon: "mail",
  },
];

const socialItems = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/herohuman2018?locale=zh_TW",
    icon: "facebook",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/herohuman2018/",
    icon: "instagram",
  },
  {
    label: "LINE",
    href: "https://lin.ee/ZuCUFkt",
    icon: "line",
  },
];

const googleMapUrl = "https://maps.app.goo.gl/F2ikqZUucTfXkxZ86";
const googleMapEmbedUrl =
  "https://www.google.com/maps?q=%E5%96%9C%E6%B4%9B%E5%95%86%E8%A1%8C%20510015%E5%8F%B0%E7%81%A3%E5%BD%B0%E5%8C%96%E7%B8%A3%E5%93%A1%E6%9E%97%E5%B8%82%E5%8D%97%E6%9D%B1%E9%87%8C%E6%B5%AE%E5%9C%B3%E8%B7%AF%E4%B8%80%E6%AE%B5205%E8%99%9F2F&output=embed";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <h2>喜洛 HeroHuman</h2>
          <p className="footer-copy">
            訂購、禮盒、課程體驗或食品服務合作，都歡迎和我們聊聊。
          </p>

          <div className="footer-contact-list">
            {contactItems.map((item) => (
              <div key={item.value} className="footer-contact-item">
                <Icon name={item.icon} />
                <div>
                  {item.href ? (
                    <Link
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                    >
                      {item.value}
                    </Link>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="footer-social-list" aria-label="喜洛社群媒體">
            {socialItems.map((item) => (
              <Link key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>
                <Icon name={item.icon} />
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-map" aria-label="喜洛烘焙 Google Map 位置">
          <iframe
            title="喜洛商行位置"
            src={googleMapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <Link href={googleMapUrl} target="_blank" rel="noreferrer" className="footer-map-link">
            在 Google Maps 開啟
          </Link>
        </div>
      </div>

      <div className="footer-bottom px-4 py-4 text-center text-sm">
        <p>© 2026 喜洛 HeroHuman</p>
      </div>
    </footer>
  );
}

function Icon({ name }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  if (name === "pin") {
    return (
      <svg {...commonProps}>
        <path d="M12 21s6-5.3 6-11a6 6 0 0 0-12 0c0 5.7 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg {...commonProps}>
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="m5 8 7 5 7-5" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...commonProps}>
        <path d="M8 5 6 7c-.6.6-.7 1.5-.3 2.2a22 22 0 0 0 9.1 9.1c.7.4 1.6.3 2.2-.3l2-2-3.2-3.2-1.5 1.5a13.5 13.5 0 0 1-4.6-4.6l1.5-1.5L8 5Z" />
      </svg>
    );
  }

  if (name === "facebook") {
    return (
      <svg {...commonProps}>
        <path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v6h3v-6h2.4l.6-3h-3V9c0-.6.4-1 1-1Z" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg {...commonProps}>
        <rect x="5" y="5" width="14" height="14" rx="4" />
        <circle cx="12" cy="12" r="3.2" />
        <path d="M16.5 7.8h.01" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M5 11.5a7 6 0 1 1 3.5 5.2L5 18l1.1-3A5.5 5.5 0 0 1 5 11.5Z" />
      <path d="M9 11h.01" />
      <path d="M12 11h.01" />
      <path d="M15 11h.01" />
    </svg>
  );
}
