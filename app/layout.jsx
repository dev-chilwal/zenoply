import "./globals.css";
import { Sora, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LocaleProvider } from "@/components/LocaleContext";
import { SITE } from "@/lib/site";

// Display: Sora · Body: Plus Jakarta Sans · Numbers/labels: JetBrains Mono.
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE.domain),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s` },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.domain,
    siteName: SITE.name,
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/og.png"],
  },
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${jakarta.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LocaleProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
