import { CartProvider } from "./components/CartContext";
import "./globals.css";

export const metadata = {
  title: "My E-Commerce",
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
