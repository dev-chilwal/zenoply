// Single source of truth for site config, categories, and tools.
export const SITE = {
  name: "Zenoply",
  domain: "https://zenoply.com",
  tagline: "Free tools that just work",
  description:
    "Free online tools — calculators, converters, PDF utilities, text and developer tools. Fast, no signup, no clutter.",
};

// icon: a key into the ICONS map (see components/CategoryIcon.jsx). Using keyed
// inline SVGs instead of emoji/Unicode glyphs so icons render identically on
// every OS and browser, and so source text stays plain ASCII.
export const CATEGORIES = [
  { slug: "finance", name: "Finance Calculators", blurb: "SIP, EMI, GST, tax, salary and loan calculators.", icon: "finance" },
  { slug: "pdf", name: "PDF Tools", blurb: "Merge, split, compress and convert PDF files.", icon: "pdf" },
  { slug: "text", name: "Text Tools", blurb: "Word count, case convert, clean and format text.", icon: "text" },
  { slug: "dev", name: "Developer Tools", blurb: "JSON, Base64, hashing, JWT and encoders.", icon: "dev" },
  { slug: "convert", name: "Converters", blurb: "Color, time, data-format and unit converters.", icon: "convert" },
  { slug: "image", name: "Image Tools", blurb: "Resize, convert, compress images and make passport photos.", icon: "image" },
];

// Each tool: slug, category, title, desc, live flag, and (for live tools) faqs.
// live:true  -> built and clickable.   live:false -> shown as a "Coming soon" tile.
export const TOOLS = [
  // ---- TEXT ----
  {
    slug: "word-counter", category: "text", live: true,
    title: "Word Counter", h1: "Word Counter",
    desc: "Free online word counter. Count words, characters, sentences and paragraphs instantly as you type.",
    faqs: [
      { q: "How does the word counter work?", a: "Paste or type your text and the counts update instantly in your browser. Nothing is uploaded or stored." },
      { q: "Does it count characters with and without spaces?", a: "Yes. It shows characters including spaces and characters excluding spaces separately." },
    ],
  },
  {
    slug: "case-converter", category: "text", live: true,
    title: "Case Converter", h1: "Case Converter",
    desc: "Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase and snake_case online for free.",
    faqs: [
      { q: "What case formats are supported?", a: "UPPERCASE, lowercase, Title Case, Sentence case, camelCase, and snake_case." },
      { q: "Is my text sent to a server?", a: "No. All conversion happens locally in your browser — your text never leaves your device." },
    ],
  },
  {
    slug: "remove-line-breaks", category: "text", live: true,
    title: "Remove Line Breaks", h1: "Remove Line Breaks",
    desc: "Strip line breaks and extra spacing from text in one click. Free online tool to remove newlines and join paragraphs.",
    faqs: [
      { q: "Can I replace line breaks with a space instead of removing them?", a: "Yes. Choose whether each line break becomes a single space or is removed entirely so the lines join directly." },
      { q: "Is my text uploaded anywhere?", a: "No. The text is processed entirely in your browser and never leaves your device." },
    ],
  },
  {
    slug: "remove-duplicate-lines", category: "text", live: true,
    title: "Remove Duplicate Lines", h1: "Remove Duplicate Lines",
    desc: "Remove duplicate lines from text or lists online for free. Keep the first occurrence, ignore case or trim spaces, and copy the unique lines.",
    faqs: [
      { q: "Which duplicate is kept?", a: "The first occurrence of each line is kept and later repeats are removed, so the original order of your list is preserved." },
      { q: "Can it treat lines with different capitalization as duplicates?", a: "Yes. Turn on 'Ignore case' and lines like 'Apple' and 'apple' are treated as the same line." },
      { q: "Is my list uploaded anywhere?", a: "No. Deduplication runs entirely in your browser — your text never leaves your device." },
    ],
  },
  {
    slug: "find-and-replace", category: "text", live: true,
    title: "Find and Replace", h1: "Find and Replace Text Online",
    desc: "Find and replace text online for free. Match case, whole words only, see how many matches were replaced, and copy or download the result instantly.",
    faqs: [
      { q: "Can I match whole words only?", a: "Yes. Turn on 'Whole words only' and searching for 'cat' will not match 'category' or 'concatenate' — only the standalone word." },
      { q: "How do I delete text instead of replacing it?", a: "Leave the 'Replace with' box empty. Every match is removed from the text." },
      { q: "Is my text uploaded anywhere?", a: "No. Find and replace runs entirely in your browser — your text never leaves your device." },
    ],
  },
  {
    slug: "lorem-ipsum-generator", category: "text", live: true,
    title: "Lorem Ipsum Generator", h1: "Lorem Ipsum Generator",
    desc: "Generate lorem ipsum placeholder text by paragraphs, sentences or words. Free dummy text generator with copy and download — no signup.",
    faqs: [
      { q: "What is lorem ipsum?", a: "Lorem ipsum is scrambled pseudo-Latin used as placeholder text in design and publishing since the 1500s. It shows how a layout looks without the meaning of real copy distracting from the design." },
      { q: "How much text can I generate?", a: "Up to 50 paragraphs, 100 sentences or 1000 words at a time, and you can generate again instantly for fresh text." },
      { q: "Can I start with the classic 'Lorem ipsum dolor sit amet' opening?", a: "Yes. Leave the checkbox on and the text begins with the traditional opening line; untick it for fully random output." },
    ],
  },
  {
    slug: "slug-generator", category: "text", live: true,
    title: "Slug Generator", h1: "URL Slug Generator",
    desc: "Convert any title into a clean, URL-friendly slug online for free. Choose hyphen or underscore separators, strip accents and symbols, copy in one click.",
    faqs: [
      { q: "What is a URL slug?", a: "A slug is the human-readable part of a URL that identifies a page, like 'my-first-post' in example.com/blog/my-first-post. Clean slugs are easier to read, share and rank in search." },
      { q: "How are accented characters handled?", a: "Accents are stripped to their plain-ASCII equivalents — 'Café à Paris' becomes 'cafe-a-paris' — so the slug is safe in any URL." },
      { q: "Should I use hyphens or underscores in slugs?", a: "Hyphens. Search engines treat hyphens as word separators, so 'best-pizza-recipe' is read as three words. Underscores are offered for non-URL uses like file or variable names." },
    ],
  },
  {
    slug: "text-reverser", category: "text", live: true,
    title: "Text Reverser", h1: "Text Reverser",
    desc: "Reverse text online for free. Flip characters, reverse the order of words, or reverse lines — instant, private, and entirely in your browser.",
    faqs: [
      { q: "What can this tool reverse?", a: "Three things: the characters in each line (so 'hello' becomes 'olleh'), the order of words within each line, or the order of lines in a block of text. Pick the mode that fits what you need." },
      { q: "Does reversing characters keep my line breaks?", a: "Yes. Each line is reversed on its own, so line breaks stay where they are and only the content within each line is flipped." },
      { q: "Is my text uploaded anywhere?", a: "No. Reversing runs entirely in your browser — your text never leaves your device." },
    ],
  },

  // ---- DEV ----
  {
    slug: "json-formatter", category: "dev", live: true,
    title: "JSON Formatter", h1: "JSON Formatter & Validator",
    desc: "Free online JSON formatter and validator. Beautify, indent and validate JSON instantly in your browser.",
    faqs: [
      { q: "Does this validate JSON?", a: "Yes. If your JSON is invalid, the error message shows what went wrong and where." },
      { q: "Is my JSON uploaded anywhere?", a: "No. Formatting and validation run entirely in your browser. Nothing is sent to a server." },
    ],
  },
  {
    slug: "base64-encoder", category: "dev", live: true,
    title: "Base64 Encoder / Decoder", h1: "Base64 Encoder & Decoder",
    desc: "Encode text to Base64 or decode Base64 to text online for free. UTF-8 safe, runs entirely in your browser.",
    faqs: [
      { q: "Does this handle non-English characters?", a: "Yes. Encoding and decoding are UTF-8 safe, so emoji and non-Latin scripts convert correctly." },
      { q: "Is my data sent to a server?", a: "No. All encoding and decoding happens locally in your browser. Nothing is uploaded." },
    ],
  },
  {
    slug: "url-encoder", category: "dev", live: true,
    title: "URL Encoder / Decoder", h1: "URL Encoder & Decoder",
    desc: "Percent-encode or decode URLs and query strings online for free. UTF-8 safe, runs entirely in your browser.",
    faqs: [
      { q: "What is the difference between encoding a component and a full URL?", a: "Component mode (the default) escapes reserved characters like / : ? & and # so the text is safe inside a query value. Full-URL mode leaves those structural characters intact so a complete link still works." },
      { q: "Is my data sent to a server?", a: "No. Encoding and decoding run entirely in your browser. Nothing is uploaded." },
    ],
  },
  {
    slug: "uuid-generator", category: "dev", live: true,
    title: "UUID Generator", h1: "UUID Generator (v4)",
    desc: "Generate random version 4 UUIDs in bulk online for free. Copy or download them — generated locally in your browser.",
    faqs: [
      { q: "What kind of UUIDs does this generate?", a: "Random version 4 (RFC 4122) UUIDs, created with your browser's cryptographic random number generator." },
      { q: "Are the UUIDs generated on a server?", a: "No. They are generated locally in your browser, so they are never seen or stored by anyone else." },
    ],
  },
  {
    slug: "hash-generator", category: "dev", live: true,
    title: "Hash Generator", h1: "Hash Generator (MD5, SHA-1, SHA-256, SHA-512)",
    desc: "Generate MD5, SHA-1, SHA-256 and SHA-512 hashes from text online for free. Fast, private, and runs entirely in your browser.",
    faqs: [
      { q: "Which hash algorithms are supported?", a: "MD5, SHA-1, SHA-256 and SHA-512. All four are computed instantly as you type." },
      { q: "Is my text sent anywhere?", a: "No. Hashing happens locally in your browser using the built-in Web Crypto API — your text never leaves your device." },
    ],
  },
  {
    slug: "jwt-decoder", category: "dev", live: true,
    title: "JWT Decoder", h1: "JWT Decoder",
    desc: "Decode JWT tokens online for free. Inspect the header, payload, issued and expiry times of any JSON Web Token instantly — fully in your browser, nothing uploaded.",
    faqs: [
      { q: "Is my token sent to a server?", a: "No. Decoding happens entirely in your browser and the token never leaves your device. Even so, avoid pasting live production tokens anywhere as a general precaution." },
      { q: "Does this verify the JWT signature?", a: "No. It decodes the header and payload so you can inspect the claims, but it does not check the signature. Signature verification requires the signing secret or public key and should happen on your server." },
      { q: "Why can a JWT be decoded without the secret?", a: "The header and payload are only Base64url-encoded, not encrypted, so anyone holding a token can read its contents. The secret is needed only to verify or create the signature." },
    ],
  },
  {
    slug: "sql-formatter", category: "dev", live: true,
    title: "SQL Formatter", h1: "SQL Formatter & Beautifier",
    desc: "Format and beautify SQL queries online for free. Indent clauses, uppercase keywords and make messy SQL readable — instant and fully in your browser.",
    faqs: [
      { q: "Which SQL dialects does this work with?", a: "It formats the standard keywords shared by PostgreSQL, MySQL, SQL Server and SQLite — SELECT, JOIN, GROUP BY, UNION and the rest. Dialect-specific syntax is passed through untouched rather than rejected." },
      { q: "Does formatting change what my query does?", a: "No. Only whitespace, line breaks and keyword casing are adjusted. Strings, identifiers, numbers and comments are preserved exactly as written." },
      { q: "Is my SQL uploaded anywhere?", a: "No. Formatting runs entirely in your browser — your queries never leave your device." },
    ],
  },
  { slug: "html-minifier", category: "dev", live: false, title: "HTML Minifier", desc: "Minify or beautify HTML markup." },

  // ---- CONVERT ----
  {
    slug: "hex-to-rgb", category: "convert", live: true,
    title: "Hex to RGB", h1: "Hex to RGB Converter",
    desc: "Convert HEX color codes to RGB values instantly. Free online hex to rgb color converter with live preview.",
    faqs: [
      { q: "What hex formats are accepted?", a: "Both 3-digit (#abc) and 6-digit (#aabbcc) hex codes, with or without the # symbol." },
      { q: "Does it show a color preview?", a: "Yes. A live swatch updates as you type so you can see the exact color." },
    ],
  },
  {
    slug: "rgb-to-hex", category: "convert", live: true,
    title: "RGB to Hex", h1: "RGB to Hex Converter",
    desc: "Convert RGB color values to a HEX color code instantly. Free online RGB to hex converter with live color preview — enter red, green and blue from 0 to 255.",
    faqs: [
      { q: "How does RGB to hex conversion work?", a: "Each channel value from 0-255 is written as a two-digit hexadecimal number, then joined as #RRGGBB. For example rgb(59, 130, 246) becomes #3b82f6." },
      { q: "What values are accepted?", a: "Whole numbers from 0 to 255 for each of the red, green and blue channels — the standard 8-bit-per-channel range used in CSS and design tools." },
      { q: "Does it show a color preview?", a: "Yes. A live swatch updates as you type so you can confirm the color before copying the hex code." },
    ],
  },
  {
    slug: "color-converter", category: "convert", live: true,
    title: "Color Converter", h1: "Color Converter (HEX, RGB, HSL, CMYK)",
    desc: "Convert colors between HEX, RGB, HSL and CMYK online for free. Paste any color code, see a live preview and copy every format in one click.",
    faqs: [
      { q: "What color formats can I enter?", a: "HEX codes like #3b82f6 (with or without the #), RGB values like rgb(59, 130, 246) or a bare 59, 130, 246, and HSL values like hsl(217, 91%, 60%). The format is detected automatically." },
      { q: "How is CMYK calculated from RGB?", a: "K = 1 - max(R, G, B) / 255, and C, M, Y are derived from each channel relative to K. CMYK is device-dependent, so printed colors can differ slightly from the on-screen preview." },
      { q: "Is my color data sent anywhere?", a: "No. All conversion happens locally in your browser — nothing is uploaded or stored." },
    ],
  },
  {
    slug: "epoch-converter", category: "convert", live: true,
    title: "Unix Timestamp Converter", h1: "Unix Timestamp Converter",
    desc: "Convert Unix epoch timestamps to readable dates and back online for free. Supports seconds and milliseconds, with local, UTC and ISO output.",
    faqs: [
      { q: "Does it support seconds and milliseconds?", a: "Yes. The converter auto-detects whether your timestamp is in seconds or milliseconds based on its size, and shows both in the results." },
      { q: "Which timezones are shown?", a: "Each result shows your local time, UTC, and the ISO 8601 string, so you can read the moment in whichever form you need." },
    ],
  },
  { slug: "json-to-csv", category: "convert", live: false, title: "JSON to CSV", desc: "Convert JSON arrays into CSV files." },
  { slug: "csv-to-json", category: "convert", live: false, title: "CSV to JSON", desc: "Convert CSV data into JSON." },
  { slug: "yaml-to-json", category: "convert", live: false, title: "YAML to JSON", desc: "Convert YAML to JSON instantly." },
  {
    slug: "number-to-words", category: "convert", live: true,
    title: "Number to Words", h1: "Number to Words Converter",
    desc: "Convert numbers to words online for free. Spell out any whole number or decimal in plain English, including negatives — instant and fully in your browser.",
    faqs: [
      { q: "How are decimals read out?", a: "The whole-number part is spelled in full, then the word 'point' is added and each digit after the decimal is read individually. So 12.5 becomes 'Twelve point five'." },
      { q: "Which number scale does it use?", a: "The short scale used in the US and modern UK English — thousand, million, billion, trillion and so on — so 1,000,000 is read as 'one million'." },
      { q: "Can it handle negative numbers and commas?", a: "Yes. A leading minus sign is read as 'negative', and commas used as thousands separators are ignored, so both 1,000 and 1000 give 'one thousand'." },
    ],
  },

  // ---- FINANCE ----
  {
    slug: "sip-calculator", category: "finance", live: true,
    title: "SIP Calculator", h1: "SIP Calculator",
    desc: "Calculate returns on your monthly SIP investments. Free online SIP calculator with invested amount, returns and total value.",
    faqs: [
      { q: "How is SIP return calculated?", a: "It uses the future value of a monthly investment series, assuming contributions at the start of each month and a constant expected annual return compounded monthly." },
      { q: "Is the expected return guaranteed?", a: "No. Mutual fund returns are market-linked. The figure is an estimate based on the rate you enter, not a guarantee." },
    ],
  },
  {
    slug: "emi-calculator", category: "finance", live: true,
    title: "EMI Calculator", h1: "EMI Calculator",
    desc: "Calculate your loan EMI, total interest and total payment. Free online EMI calculator for home, car and personal loans.",
    faqs: [
      { q: "How is EMI calculated?", a: "EMI = [P x R x (1+R)^N] / [(1+R)^N - 1], where P is principal, R is the monthly interest rate, and N is the number of monthly instalments." },
      { q: "Does a longer tenure reduce my EMI?", a: "Yes, a longer tenure lowers the monthly EMI but increases the total interest you pay over the life of the loan." },
    ],
  },
  {
    slug: "gst-calculator", category: "finance", live: true,
    title: "GST Calculator", h1: "GST Calculator",
    desc: "Add or remove GST and see the tax breakup instantly. Free online GST calculator for 3%, 5%, 12%, 18% and 28% slabs.",
    faqs: [
      { q: "How do I add GST to an amount?", a: "Choose 'Add GST', enter the base amount and rate. GST = amount x rate, and the total is amount + GST." },
      { q: "How do I remove GST from an inclusive price?", a: "Choose 'Remove GST'. Base = total / (1 + rate), and GST is the difference between the total and the base." },
    ],
  },
  { slug: "income-tax-calculator", category: "finance", live: false, title: "Income Tax Calculator", desc: "Estimate your income tax under the new regime." },
  { slug: "in-hand-salary-calculator", category: "finance", live: false, title: "In-Hand Salary Calculator", desc: "Work out take-home pay from your CTC." },
  {
    slug: "fd-calculator", category: "finance", live: true,
    title: "FD Calculator", h1: "FD Calculator",
    desc: "Calculate fixed deposit maturity and interest earned. Free online FD calculator using quarterly compounding as used by Indian banks.",
    faqs: [
      { q: "How is FD interest calculated?", a: "Most Indian banks compound FD interest quarterly: A = P x (1 + r/4)^(4 x t). This calculator uses that convention." },
      { q: "Is FD interest taxable?", a: "Yes. Interest earned on fixed deposits is taxable as per your income tax slab, and banks may deduct TDS above a threshold." },
    ],
  },
  {
    slug: "compound-interest-calculator", category: "finance", live: true,
    title: "Compound Interest Calculator", h1: "Compound Interest Calculator",
    desc: "See how your money grows with compounding. Free compound interest calculator with annual, half-yearly, quarterly and monthly options.",
    faqs: [
      { q: "What is the compound interest formula?", a: "A = P x (1 + r/n)^(n x t), where P is principal, r is the annual rate, n is the compounding frequency per year, and t is the number of years." },
      { q: "Does compounding frequency matter?", a: "Yes. More frequent compounding (monthly vs annually) produces a slightly higher maturity value for the same rate." },
    ],
  },
  {
    slug: "mortgage-calculator", category: "finance", live: true,
    title: "Mortgage Calculator", h1: "Mortgage Calculator",
    desc: "Calculate your monthly mortgage payment, total interest and total cost. Free online mortgage calculator for any loan amount, rate and term.",
    faqs: [
      { q: "How is the monthly mortgage payment calculated?", a: "It uses the standard amortization formula: M = P x [i(1+i)^n] / [(1+i)^n - 1], where P is the loan amount, i is the monthly interest rate, and n is the number of monthly payments." },
      { q: "Does this include taxes and insurance?", a: "No. It calculates principal and interest only. Property tax, home insurance and PMI vary by location and lender, so add them separately for a full monthly cost." },
    ],
  },
  {
    slug: "percentage-calculator", category: "finance", live: true,
    title: "Percentage Calculator", h1: "Percentage Calculator",
    desc: "Calculate percentages three ways: what is X% of Y, X is what percent of Y, and percentage increase or decrease. Free and instant.",
    faqs: [
      { q: "How do I find what percent one number is of another?", a: "Use the 'X is what % of Y' mode. The result is (X / Y) x 100. For example, 30 is 15% of 200." },
      { q: "How is percentage increase or decrease calculated?", a: "Percentage change = ((new - old) / |old|) x 100. A positive result is an increase; a negative result is a decrease." },
    ],
  },
  { slug: "ppf-calculator", category: "finance", live: false, title: "PPF Calculator", desc: "Project your PPF maturity value over time." },

  // ---- PDF ----
  { slug: "merge-pdf", category: "pdf", live: false, title: "Merge PDF", desc: "Combine multiple PDF files into one." },
  { slug: "split-pdf", category: "pdf", live: false, title: "Split PDF", desc: "Split a PDF into separate pages or ranges." },
  { slug: "compress-pdf", category: "pdf", live: false, title: "Compress PDF", desc: "Reduce PDF file size while keeping quality." },
  { slug: "pdf-to-jpg", category: "pdf", live: false, title: "PDF to JPG", desc: "Convert PDF pages into JPG images." },
  { slug: "jpg-to-pdf", category: "pdf", live: false, title: "JPG to PDF", desc: "Turn images into a single PDF." },
  { slug: "rotate-pdf", category: "pdf", live: false, title: "Rotate PDF", desc: "Rotate PDF pages and save." },
  { slug: "unlock-pdf", category: "pdf", live: false, title: "Unlock PDF", desc: "Remove a password from a PDF you own." },
  { slug: "watermark-pdf", category: "pdf", live: false, title: "Watermark PDF", desc: "Add a text or image watermark to a PDF." },

  // ---- IMAGE ----
  {
    slug: "image-resizer", category: "image", live: true,
    title: "Image Resizer", h1: "Image Resizer",
    desc: "Resize images to any width and height online for free. Keep aspect ratio or use presets. Runs in your browser — nothing is uploaded.",
    faqs: [
      { q: "Are my images uploaded to a server?", a: "No. Resizing happens entirely in your browser using your device. Your images never leave your computer." },
      { q: "Can I keep the aspect ratio?", a: "Yes. Turn on 'Lock aspect ratio' and changing the width updates the height automatically so the image isn't stretched." },
    ],
  },
  {
    slug: "image-converter", category: "image", live: true,
    title: "Image Converter", h1: "Image Converter (PNG, JPG, WebP)",
    desc: "Convert images between PNG, JPG and WebP online for free. Fast, private, in-browser conversion with no upload and no watermark.",
    faqs: [
      { q: "Which formats are supported?", a: "You can convert between PNG, JPG (JPEG) and WebP. Pick your output format and download the converted image." },
      { q: "Will converting to JPG lose transparency?", a: "Yes — JPG does not support transparency, so transparent areas become white. Use PNG or WebP if you need to keep transparency." },
    ],
  },
  {
    slug: "image-compressor", category: "image", live: true,
    title: "Image Compressor", h1: "Image Compressor",
    desc: "Compress JPG and WebP images to reduce file size while keeping quality. Free, private, in-browser — see the before and after size instantly.",
    faqs: [
      { q: "How does compression work?", a: "It re-encodes the image at a quality level you choose. Lower quality means a smaller file. You can preview the size saving before downloading." },
      { q: "Is there a file size limit?", a: "No fixed limit — because it runs in your browser, the only constraint is your device's memory. Very large images may take a moment." },
    ],
  },
  {
    slug: "passport-photo-maker", category: "image", live: true,
    title: "Passport Photo Maker", h1: "Passport Photo Maker",
    desc: "Create passport and visa photos in the correct size for the US, India, UK and more. Crop to the right dimensions at print quality, free and in-browser.",
    faqs: [
      { q: "Which passport photo sizes are supported?", a: "Common presets including US (2x2 inch / 51x51 mm), India (35x45 mm), UK/EU (35x45 mm) and Schengen visa. The output is sized at print resolution (300 DPI)." },
      { q: "Is this an official photo service?", a: "No. It crops and sizes your photo to the correct dimensions, but you are responsible for meeting your country's background, expression and lighting rules." },
    ],
  },
];

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug);
export const toolsInCategory = (slug) => TOOLS.filter((t) => t.category === slug);
export const liveTools = () => TOOLS.filter((t) => t.live);
export const getTool = (cat, slug) =>
  TOOLS.find((t) => t.category === cat && t.slug === slug && t.live);
export const relatedTools = (tool, n = 4) =>
  TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug && t.live).slice(0, n);
