import "@/assets/css/general.css";
import "react-toastify/dist/ReactToastify.css";

import StoreProvider from "@/context/StoreProvider";
import ThemeSwitcherContextProvider from "@/context/ThemeSwitcherContextProvider";
import { ToastContainer } from "react-toastify";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "DevSignal — Signal Over Noise",
  description: "Curated developer intelligence for the Next.js ecosystem.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ToastContainer position="top-right" theme="dark" />
        <StoreProvider>
          <ThemeSwitcherContextProvider>
            {children}
          </ThemeSwitcherContextProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
