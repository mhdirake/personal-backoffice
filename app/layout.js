import "@/assets/css/general.css";
import "react-toastify/dist/ReactToastify.css";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import StoreProvider from "@/context/StoreProvider";
import ThemeSwitcherContextProvider from "@/context/ThemeSwitcherContextProvider";
import { ToastContainer } from "react-toastify";
import { Outfit, JetBrains_Mono } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "DevSignal — Signal Over Noise",
  description: "Curated developer intelligence for the Next.js ecosystem.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AppRouterCacheProvider>
          <StoreProvider>
            <ThemeSwitcherContextProvider>
              <ToastContainer position="top-right" theme="dark" />
              {children}
            </ThemeSwitcherContextProvider>
          </StoreProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
