import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE } from "@/lib/site";

export const metadata = {
  title: `Privacy — Nothing Uploaded, No Signup | ${SITE.name}`,
  description:
    "Every Zenoply tool runs entirely in your browser. Your files and figures are never uploaded, there is no account, and there are no tracking scripts.",
  alternates: { canonical: `${SITE.domain}/privacy/` },
};

export default function Privacy() {
  return (
    <div className="container tool-layout">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy" }]} />
      <h1>Privacy</h1>
      <p className="lead">
        Every tool on Zenoply runs entirely inside your browser. Your files and figures are
        never uploaded, there is no account to create, and there are no tracking scripts.
      </p>

      <div className="prose">
        <h2>Your files are never uploaded</h2>
        <p>
          When you merge a PDF, compress an image, OCR a scan or work out your take-home
          salary, the work happens on your own device using JavaScript and WebAssembly. The
          file you choose is read into memory by your browser and the result is written back
          out as a download. Nothing is transmitted to Zenoply or anyone else, which is also
          why the tools keep working if you go offline after the page has loaded.
        </p>
        <p>
          This is a property of how the site is built rather than a promise we ask you to take
          on trust: Zenoply is a static site with no backend and no API to upload anything to.
          You can confirm it yourself by opening your browser&rsquo;s developer tools, switching
          to the Network tab, and running any tool — you will see no request carrying your data.
        </p>

        <h2>No account, ever</h2>
        <p>
          There is no sign-up, no login, no email capture and no free-tier limit that pushes you
          into one. Every tool is free to use as often as you like, and none of them watermark
          their output.
        </p>

        <h2>No tracking, no analytics, no ads</h2>
        <p>
          Zenoply loads no analytics, advertising or tracking scripts of any kind, and embeds
          nothing from third-party services. Fonts and the WebAssembly components that power
          the PDF, OCR and image tools are served from zenoply.com itself rather than an
          external CDN, so simply visiting a page does not announce you to anyone else.
        </p>

        <h2>Cookies and local storage</h2>
        <p>
          Zenoply sets no cookies. The only thing kept on your device is a single browser
          local-storage entry named <code>theme</code>, which remembers whether you chose the
          light or dark appearance. Clearing your site data removes it, and nothing breaks if
          you do.
        </p>

        <h2>Server logs</h2>
        <p>
          The site is hosted on Cloudflare Pages. Like any web host, it processes standard
          request information — such as the page requested, your IP address and your browser&rsquo;s
          user-agent string — in order to serve the page and to protect against abuse. Zenoply
          does not add its own logging on top of this, and because the tools never transmit your
          content, no file or figure you work on can appear in those logs.
        </p>

        <h2>Questions</h2>
        <p>
          If anything here is unclear, the individual tool pages each answer the same question
          in their FAQ section. Start from the <Link href="/">tool directory</Link> or the{" "}
          <Link href="/guides">guides</Link>.
        </p>
      </div>
    </div>
  );
}
