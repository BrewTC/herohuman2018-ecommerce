import { CartProvider } from "./components/CartContext";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://herohuman2018-ecommerce.vercel.app/"),
  title: "喜洛 HeroHuman",
  applicationName: "喜洛 HeroHuman",
  description: "喜洛 HeroHuman，陪食品人把好產品、好味道與實用工具帶到更多人面前。",
  openGraph: {
    title: "喜洛 HeroHuman",
    description: "喜洛 HeroHuman，陪食品人把好產品、好味道與實用工具帶到更多人面前。",
    url: "https://herohuman2018-ecommerce.vercel.app/",
    siteName: "喜洛 HeroHuman",
    locale: "zh_TW",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
