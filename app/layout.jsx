import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(SITE.domain),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s` },
  description: SITE.description,
};

// Runs before first paint to set the theme — prevents a flash of the wrong theme.
const themeScript =
  "(function(){try{" +
  "var t=localStorage.getItem('theme');" +
  "if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}" +
  "document.documentElement.setAttribute('data-theme',t);" +
  "}catch(e){}})();";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
