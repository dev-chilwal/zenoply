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
    guide: { slug: "what-is-json", title: "What Is JSON?" },
    title: "JSON Formatter", h1: "JSON Formatter & Validator",
    desc: "Free online JSON formatter and validator. Beautify, indent and validate JSON instantly in your browser.",
    faqs: [
      { q: "Does this validate JSON?", a: "Yes. If your JSON is invalid, the error message shows what went wrong and where." },
      { q: "Is my JSON uploaded anywhere?", a: "No. Formatting and validation run entirely in your browser. Nothing is sent to a server." },
    ],
  },
  {
    slug: "base64-encoder", category: "dev", live: true,
    guide: { slug: "what-is-base64-encoding", title: "What Is Base64 Encoding?" },
    title: "Base64 Encoder / Decoder", h1: "Base64 Encoder & Decoder",
    desc: "Encode text to Base64 or decode Base64 to text online for free. UTF-8 safe, runs entirely in your browser.",
    faqs: [
      { q: "Does this handle non-English characters?", a: "Yes. Encoding and decoding are UTF-8 safe, so emoji and non-Latin scripts convert correctly." },
      { q: "Is my data sent to a server?", a: "No. All encoding and decoding happens locally in your browser. Nothing is uploaded." },
    ],
  },
  {
    slug: "url-encoder", category: "dev", live: true,
    guide: { slug: "what-is-url-encoding", title: "What Is URL Encoding?" },
    title: "URL Encoder / Decoder", h1: "URL Encoder & Decoder",
    desc: "Percent-encode or decode URLs and query strings online for free. UTF-8 safe, runs entirely in your browser.",
    faqs: [
      { q: "What is the difference between encoding a component and a full URL?", a: "Component mode (the default) escapes reserved characters like / : ? & and # so the text is safe inside a query value. Full-URL mode leaves those structural characters intact so a complete link still works." },
      { q: "Is my data sent to a server?", a: "No. Encoding and decoding run entirely in your browser. Nothing is uploaded." },
    ],
  },
  {
    slug: "uuid-generator", category: "dev", live: true,
    guide: { slug: "what-is-a-uuid", title: "What Is a UUID?" },
    title: "UUID Generator", h1: "UUID Generator (v4)",
    desc: "Generate random version 4 UUIDs in bulk online for free. Copy or download them — generated locally in your browser.",
    faqs: [
      { q: "What kind of UUIDs does this generate?", a: "Random version 4 (RFC 4122) UUIDs, created with your browser's cryptographic random number generator." },
      { q: "Are the UUIDs generated on a server?", a: "No. They are generated locally in your browser, so they are never seen or stored by anyone else." },
    ],
  },
  {
    slug: "hash-generator", category: "dev", live: true,
    guide: { slug: "md5-vs-sha256-hashing-explained", title: "MD5 vs SHA-256: How Hashing Works" },
    title: "Hash Generator", h1: "Hash Generator (MD5, SHA-1, SHA-256, SHA-512)",
    desc: "Generate MD5, SHA-1, SHA-256 and SHA-512 hashes from text online for free. Fast, private, and runs entirely in your browser.",
    faqs: [
      { q: "Which hash algorithms are supported?", a: "MD5, SHA-1, SHA-256 and SHA-512. All four are computed instantly as you type." },
      { q: "Is my text sent anywhere?", a: "No. Hashing happens locally in your browser using the built-in Web Crypto API — your text never leaves your device." },
    ],
  },
  {
    slug: "jwt-decoder", category: "dev", live: true,
    guide: { slug: "what-is-inside-a-jwt", title: "What Is Inside a JWT?" },
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
  {
    slug: "html-minifier", category: "dev", live: true,
    title: "HTML Minifier", h1: "HTML Minifier",
    desc: "Minify HTML online for free. Collapse whitespace, strip comments and shrink markup to load faster — instant, private, and fully in your browser.",
    faqs: [
      { q: "How does minifying HTML reduce file size?", a: "It collapses runs of whitespace to a single space, removes the gaps between tags and optionally strips comments. The page renders identically but transfers fewer bytes, so it loads faster." },
      { q: "Will minifying break my page, pre blocks or scripts?", a: "No. The contents of pre, textarea, script and style tags are preserved exactly, so formatted code, inline JavaScript and CSS keep their original spacing." },
      { q: "Are conditional comments removed?", a: "No. Conditional comments like <!--[if IE]> are kept because they affect rendering. Only ordinary comments are removed, and only when you leave the option on." },
      { q: "Is my HTML uploaded anywhere?", a: "No. Minifying runs entirely in your browser — your markup never leaves your device." },
    ],
  },

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
    guide: { slug: "what-is-a-unix-timestamp", title: "What Is a Unix Timestamp?" },
    title: "Unix Timestamp Converter", h1: "Unix Timestamp Converter",
    desc: "Convert Unix epoch timestamps to readable dates and back online for free. Supports seconds and milliseconds, with local, UTC and ISO output.",
    faqs: [
      { q: "Does it support seconds and milliseconds?", a: "Yes. The converter auto-detects whether your timestamp is in seconds or milliseconds based on its size, and shows both in the results." },
      { q: "Which timezones are shown?", a: "Each result shows your local time, UTC, and the ISO 8601 string, so you can read the moment in whichever form you need." },
    ],
  },
  {
    slug: "json-to-csv", category: "convert", live: true,
    title: "JSON to CSV", h1: "JSON to CSV Converter",
    desc: "Convert a JSON array to CSV online for free. Turn an array of objects into a spreadsheet-ready CSV with headers, choose your delimiter, and copy or download — fully in your browser.",
    faqs: [
      { q: "What JSON shape does it accept?", a: "An array at the top level — either an array of objects (the keys become the column headers) or an array of arrays (each inner array is a row). Nested objects and arrays in a cell are written as JSON text." },
      { q: "How are commas and quotes inside values handled?", a: "Any value containing the delimiter, a double quote or a line break is wrapped in double quotes, and embedded quotes are doubled, following the RFC 4180 CSV rules so the file opens correctly in Excel and Google Sheets." },
      { q: "Is my data uploaded anywhere?", a: "No. Conversion runs entirely in your browser — your JSON never leaves your device." },
    ],
  },
  {
    slug: "csv-to-json", category: "convert", live: true,
    title: "CSV to JSON", h1: "CSV to JSON Converter",
    desc: "Convert CSV to JSON online for free. Parse comma, tab, semicolon or pipe-separated data into a clean JSON array, use the first row as keys, and copy or download — all in your browser.",
    faqs: [
      { q: "Does it use the first row as the JSON keys?", a: "Yes, by default. With 'First row is a header' on, each remaining row becomes an object keyed by the header names. Turn it off and you get an array of arrays instead." },
      { q: "Can it parse fields that contain commas or line breaks?", a: "Yes. Quoted fields are parsed per the RFC 4180 standard, so commas, newlines and escaped double quotes inside a quoted value are handled correctly." },
      { q: "Will numbers stay as text or become real numbers?", a: "Your choice. With 'Convert numbers and true/false to typed values' on, plain numbers and the words true/false are output as JSON numbers and booleans; otherwise every value stays a string." },
    ],
  },
  {
    slug: "yaml-to-json", category: "convert", live: true,
    title: "YAML to JSON", h1: "YAML to JSON Converter",
    desc: "Convert YAML to JSON online for free. Paste config or data and get clean, pretty-printed JSON instantly — handles nested maps, lists and inline values, fully in your browser.",
    faqs: [
      { q: "What YAML can it convert?", a: "Indentation-based mappings and lists, nested blocks, inline (flow) arrays and objects like [1, 2] and {a: b}, quoted strings, numbers, booleans and nulls. It covers the YAML people typically paste from config files." },
      { q: "Are anchors, tags or block scalars supported?", a: "No. Advanced YAML features such as anchors (&, *), explicit tags (!!type) and multi-line block scalars (|, >) are not converted, and the tool reports an error rather than guessing." },
      { q: "Is my YAML uploaded anywhere?", a: "No. Conversion runs entirely in your browser — your data never leaves your device." },
    ],
  },
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
    guide: { slug: "how-does-sip-investment-work", title: "How Does SIP Investment Work?" },
    desc: "Calculate returns on your monthly SIP investments. Free online SIP calculator with invested amount, returns and total value.",
    faqs: [
      { q: "How is SIP return calculated?", a: "It uses the future value of a monthly investment series, assuming contributions at the start of each month and a constant expected annual return compounded monthly." },
      { q: "Is the expected return guaranteed?", a: "No. Mutual fund returns are market-linked. The figure is an estimate based on the rate you enter, not a guarantee." },
    ],
  },
  {
    slug: "step-up-sip-calculator", category: "finance", live: true,
    title: "Step-Up SIP Calculator", h1: "Step-Up SIP Calculator",
    guide: { slug: "how-does-sip-investment-work", title: "How Does SIP Investment Work?" },
    desc: "Calculate a step-up (top-up) SIP where you raise your monthly investment every year. Free online step-up SIP calculator with returns and total value.",
    faqs: [
      { q: "What is a step-up SIP?", a: "A step-up (or top-up) SIP automatically increases your monthly investment by a fixed percentage each year, usually in line with your rising income. So a 10% annual step-up on a ₹10,000 SIP invests ₹10,000 a month in year one, ₹11,000 in year two, and so on." },
      { q: "How much more does a step-up SIP grow versus a regular one?", a: "Because you invest more over time and each increase compounds for the remaining years, a step-up SIP usually ends with a noticeably larger corpus than a flat SIP of the same starting amount. Set the step-up to 0% to compare against a regular SIP." },
      { q: "How is the step-up SIP value calculated?", a: "The calculator raises the monthly contribution by your step-up percentage at the start of each year and compounds every month's investment at the expected return until the end of the period." },
    ],
  },
  {
    slug: "emi-calculator", category: "finance", live: true,
    title: "EMI Calculator", h1: "EMI Calculator",
    guide: { slug: "how-is-emi-calculated", title: "How Is EMI Calculated?" },
    desc: "Calculate your loan EMI, total interest and total payment. Free online EMI calculator for home, car and personal loans.",
    faqs: [
      { q: "How is EMI calculated?", a: "EMI = [P x R x (1+R)^N] / [(1+R)^N - 1], where P is principal, R is the monthly interest rate, and N is the number of monthly instalments." },
      { q: "Does a longer tenure reduce my EMI?", a: "Yes, a longer tenure lowers the monthly EMI but increases the total interest you pay over the life of the loan." },
    ],
  },
  {
    slug: "gst-calculator", category: "finance", live: true,
    title: "GST Calculator", h1: "GST Calculator",
    guide: { slug: "how-is-gst-calculated", title: "How Is GST Calculated?" },
    desc: "Add or remove GST and see the tax breakup instantly. Free online GST calculator for 3%, 5%, 12%, 18% and 28% slabs.",
    faqs: [
      { q: "How do I add GST to an amount?", a: "Choose 'Add GST', enter the base amount and rate. GST = amount x rate, and the total is amount + GST." },
      { q: "How do I remove GST from an inclusive price?", a: "Choose 'Remove GST'. Base = total / (1 + rate), and GST is the difference between the total and the base." },
    ],
  },
  {
    slug: "income-tax-calculator", category: "finance", live: true,
    title: "Income Tax Calculator", h1: "Income Tax Calculator",
    desc: "Free online income tax calculator for FY 2025-26 (AY 2026-27). Compare the old and new regime and see which one gives you lower tax.",
    faqs: [
      { q: "Which tax regime should I choose, old or new?", a: "It depends on your deductions. The new regime has lower slab rates and a ₹75,000 standard deduction but allows almost no other deductions; the old regime has higher rates but lets you claim 80C, 80D, HRA, home-loan interest and more. This calculator computes both and shows which gives lower tax for your numbers." },
      { q: "How is income up to ₹12 lakh tax-free under the new regime?", a: "For FY 2025-26, the Section 87A rebate under the new regime makes tax zero for taxable income up to ₹12,00,000 (a ₹60,000 rebate). With the ₹75,000 standard deduction, a salaried person earning up to ₹12.75 lakh pays no tax. Marginal relief applies just above the threshold." },
    ],
    guide: { slug: "old-vs-new-tax-regime", title: "Old vs New Tax Regime: Which Saves More?" },
  },
  {
    slug: "in-hand-salary-calculator", category: "finance", live: true,
    guide: { slug: "how-is-in-hand-salary-calculated-from-ctc", title: "How Is In-Hand Salary Calculated From CTC?" },
    title: "In-Hand Salary Calculator", h1: "In-Hand Salary Calculator",
    desc: "Free online in-hand salary calculator. Work out your monthly take-home pay from CTC after PF, professional tax and income tax for FY 2025-26.",
    faqs: [
      { q: "How is in-hand salary calculated from CTC?", a: "CTC includes employer contributions, so take-home is lower. This tool subtracts the employer's PF and gratuity to get your gross salary, then deducts your own PF (12% of Basic), professional tax and income tax to arrive at monthly in-hand pay." },
      { q: "Why is my actual take-home different?", a: "CTC structures vary by employer — the split between Basic, HRA and allowances, the PF wage ceiling, and components like bonuses or insurance all change the result. This is an estimate; check your offer letter or payslip for exact figures." },
    ],
  },
  {
    slug: "fd-calculator", category: "finance", live: true,
    guide: { slug: "how-is-fd-interest-calculated", title: "How Is FD Interest Calculated?" },
    title: "FD Calculator", h1: "FD Calculator",
    desc: "Calculate fixed deposit maturity and interest earned. Free online FD calculator using quarterly compounding as used by Indian banks.",
    faqs: [
      { q: "How is FD interest calculated?", a: "Most Indian banks compound FD interest quarterly: A = P x (1 + r/4)^(4 x t). This calculator uses that convention." },
      { q: "Is FD interest taxable?", a: "Yes. Interest earned on fixed deposits is taxable as per your income tax slab, and banks may deduct TDS above a threshold." },
    ],
  },
  {
    slug: "compound-interest-calculator", category: "finance", live: true,
    guide: { slug: "what-is-compound-interest", title: "What Is Compound Interest?" },
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
    guide: { slug: "mortgage-principal-vs-interest", title: "Mortgage Principal vs Interest, Explained" },
    desc: "Calculate your monthly mortgage payment, total interest and total cost. Free online mortgage calculator for any loan amount, rate and term.",
    faqs: [
      { q: "How is the monthly mortgage payment calculated?", a: "It uses the standard amortization formula: M = P x [i(1+i)^n] / [(1+i)^n - 1], where P is the loan amount, i is the monthly interest rate, and n is the number of monthly payments." },
      { q: "Does this include taxes and insurance?", a: "No. It calculates principal and interest only. Property tax, home insurance and PMI vary by location and lender, so add them separately for a full monthly cost." },
    ],
  },
  {
    slug: "percentage-calculator", category: "finance", live: true,
    title: "Percentage Calculator", h1: "Percentage Calculator",
    guide: { slug: "how-to-calculate-percentage-increase", title: "How to Calculate Percentage Increase" },
    desc: "Calculate percentages three ways: what is X% of Y, X is what percent of Y, and percentage increase or decrease. Free and instant.",
    faqs: [
      { q: "How do I find what percent one number is of another?", a: "Use the 'X is what % of Y' mode. The result is (X / Y) x 100. For example, 30 is 15% of 200." },
      { q: "How is percentage increase or decrease calculated?", a: "Percentage change = ((new - old) / |old|) x 100. A positive result is an increase; a negative result is a decrease." },
    ],
  },
  {
    slug: "ppf-calculator", category: "finance", live: true,
    title: "PPF Calculator", h1: "PPF Calculator",
    desc: "Estimate your Public Provident Fund (PPF) maturity and interest. Free online PPF calculator using annual compounding over a 15-year tenure.",
    faqs: [
      { q: "How is PPF maturity calculated?", a: "It assumes you deposit the same amount at the start of each year and that interest is compounded annually, so the full year-start balance earns a complete year of interest: Maturity = P x ((1 + i)^n - 1) / i x (1 + i). A Rs 1,50,000 yearly deposit for 15 years at 7.1% grows to about Rs 40.68 lakh." },
      { q: "What are the PPF deposit limits and tenure?", a: "You can deposit between Rs 500 and Rs 1,50,000 per financial year. The base tenure is 15 years, extendable in blocks of 5 years. The rate (currently 7.1% p.a.) is set by the government each quarter." },
    ],
    guide: { slug: "how-is-ppf-interest-calculated", title: "How Is PPF Interest Calculated?" },
  },
  {
    slug: "rd-calculator", category: "finance", live: true,
    title: "RD Calculator", h1: "RD Calculator",
    desc: "Calculate recurring deposit maturity and interest earned. Free online RD calculator using quarterly compounding as used by Indian banks.",
    faqs: [
      { q: "How is RD interest calculated?", a: "Indian banks compound recurring deposit interest quarterly. Each monthly instalment earns interest, compounded every quarter until maturity, using M = P x [(1 + i)^n - 1] / [1 - (1 + i)^(-1/3)], where P is the monthly deposit, i is the quarterly rate (annual rate / 4) and n is the number of quarters." },
      { q: "Why is the tenure set in steps of 3 months?", a: "Because RD interest is compounded quarterly, the standard bank formula works in whole quarters, so the tenure is entered in multiples of 3 months. RD tenures typically range from 6 months to 10 years." },
    ],
    guide: { slug: "how-is-rd-interest-calculated", title: "How Is Recurring Deposit (RD) Interest Calculated?" },
  },
  {
    slug: "lumpsum-calculator", category: "finance", live: true,
    title: "Lumpsum Calculator", h1: "Lumpsum Calculator",
    desc: "Estimate the maturity value of a one-time investment. Free online lumpsum calculator with invested amount, estimated returns and total value.",
    faqs: [
      { q: "How is lumpsum return calculated?", a: "A one-time investment grows with annual compounding: Total value = P x (1 + r)^t, where P is the amount invested, r is the expected annual return and t is the number of years. Estimated returns are the total value minus the amount invested." },
      { q: "What is the difference between lumpsum and SIP?", a: "A lumpsum is a single one-time investment, while an SIP invests a fixed amount every month. Lumpsum suits money you can invest all at once; SIP spreads investment over time and averages out market ups and downs." },
    ],
    guide: { slug: "how-does-a-lumpsum-investment-grow", title: "How Does a Lumpsum Investment Grow?" },
  },
  {
    slug: "swp-calculator", category: "finance", live: true,
    title: "SWP Calculator", h1: "SWP Calculator",
    desc: "See your remaining corpus after regular monthly withdrawals and how long your money lasts. Free online SWP (Systematic Withdrawal Plan) calculator.",
    faqs: [
      { q: "How does an SWP calculator work?", a: "It starts with your invested corpus, adds monthly compounded returns and subtracts a fixed withdrawal at the end of each month. The result is the balance left after the chosen period, and it flags if the corpus runs out earlier." },
      { q: "Can my corpus run out with an SWP?", a: "Yes. If your monthly withdrawal is larger than the returns the corpus earns, the balance shrinks each month and can deplete before the period ends. The calculator shows roughly when that happens." },
    ],
    guide: { slug: "how-does-a-systematic-withdrawal-plan-work", title: "How Does a Systematic Withdrawal Plan (SWP) Work?" },
  },
  {
    slug: "cagr-calculator", category: "finance", live: true,
    title: "CAGR Calculator", h1: "CAGR Calculator",
    desc: "Find the compound annual growth rate of an investment from its initial value, final value and number of years. Free online CAGR calculator.",
    faqs: [
      { q: "How is CAGR calculated?", a: "CAGR = ((Final value / Initial value)^(1 / years) - 1) x 100. It is the constant annual rate at which an investment would have grown from its initial to its final value over the period, assuming no interim cash flows." },
      { q: "How is CAGR different from total return?", a: "Total return is the overall percentage gain across the whole period. CAGR converts that into a smoothed per-year rate, which makes investments held for different lengths of time comparable." },
    ],
    guide: { slug: "how-is-cagr-calculated", title: "What Is CAGR and How Is It Calculated?" },
  },
  {
    slug: "roi-calculator", category: "finance", live: true,
    title: "ROI Calculator", h1: "ROI Calculator",
    desc: "Calculate your return on investment, net gain and annualized ROI from the amount invested and final value. Free online ROI calculator.",
    faqs: [
      { q: "How is ROI calculated?", a: "ROI = ((Final value - Amount invested) / Amount invested) x 100. It is the total percentage return over the whole holding period. The net gain is simply the final value minus the amount invested." },
      { q: "What is annualized ROI?", a: "Annualized ROI converts the total return into a per-year rate using ((Final value / Invested)^(1 / years) - 1) x 100, so returns earned over different periods can be compared fairly. It is shown when you enter a holding period." },
    ],
    guide: { slug: "how-is-roi-calculated", title: "What Is ROI and How Is It Calculated?" },
  },
  {
    slug: "simple-interest-calculator", category: "finance", live: true,
    title: "Simple Interest Calculator", h1: "Simple Interest Calculator",
    desc: "Calculate simple interest and the total amount on a deposit or loan. Free online simple interest calculator using SI = P x R x T / 100.",
    faqs: [
      { q: "What is the simple interest formula?", a: "Simple interest is SI = P x R x T / 100, where P is the principal, R is the annual interest rate and T is the time in years. The total amount is the principal plus the interest, and interest does not compound." },
      { q: "How is simple interest different from compound interest?", a: "Simple interest is charged only on the original principal, so it grows linearly. Compound interest is charged on the principal plus accumulated interest, so it grows faster over time." },
    ],
  },
  {
    slug: "inflation-calculator", category: "finance", live: true,
    title: "Inflation Calculator", h1: "Inflation Calculator",
    desc: "See the future cost of any amount and how inflation erodes your money's purchasing power over time. Free online inflation calculator.",
    faqs: [
      { q: "How is the future cost calculated?", a: "Future cost = Present amount x (1 + inflation rate)^years. It compounds the current cost up by the inflation rate each year, so an amount that buys something today will cost more in future." },
      { q: "What is purchasing power?", a: "Purchasing power is how much a fixed amount can actually buy. As prices rise, the same money buys less, so the calculator also shows what today's amount will be worth in future: Present amount / (1 + inflation rate)^years." },
    ],
  },
  {
    slug: "nps-calculator", category: "finance", live: true,
    title: "NPS Calculator", h1: "NPS Calculator",
    desc: "Free online NPS calculator to estimate your National Pension System corpus, tax-free lump sum, annuity amount and monthly pension at retirement.",
    faqs: [
      { q: "How much of my NPS corpus must I use to buy an annuity?", a: "Under current NPS rules, at least 40% of the accumulated corpus must be used to purchase an annuity that provides your monthly pension. The remaining up to 60% can be withdrawn as a lump sum, which is tax-free. The calculator enforces this 40% minimum and lets you raise the annuity share up to 100%." },
      { q: "How is the monthly pension estimated?", a: "The annuitised amount is multiplied by the expected annuity rate and divided by 12. For example, an annuitised corpus of Rs 91,17,301 at a 6% annuity rate gives roughly Rs 45,587 per month. The actual pension depends on the annuity plan and rates offered by the chosen insurer at retirement." },
    ],
    guide: { slug: "how-is-nps-corpus-and-pension-calculated", title: "How Is Your NPS Corpus and Pension Calculated?" },
  },
  {
    slug: "gratuity-calculator", category: "finance", live: true,
    title: "Gratuity Calculator", h1: "Gratuity Calculator",
    desc: "Free online gratuity calculator for India under the Payment of Gratuity Act. Estimate gratuity from Basic+DA and years of service using the 15/26 formula.",
    faqs: [
      { q: "Why is the gratuity formula divided by 26 and not 30?", a: "Under the Payment of Gratuity Act, a month is treated as 26 working days because four Sundays are excluded as paid weekly off-days. So one day's wage equals the monthly Basic+DA divided by 26, and 15 such days are credited for each completed year of service, giving the (15 x salary x years) / 26 formula." },
      { q: "How are part-years of service rounded for gratuity?", a: "Service is rounded to a whole number of years. If the part-year in your final year is more than 6 months, it rounds up to the next full year (e.g. 10 years 7 months becomes 11 years). If it is 6 months or less, it is dropped (e.g. 10 years 4 months stays 10 years)." },
    ],
    guide: { slug: "how-is-gratuity-calculated", title: "How Is Gratuity Calculated?" },
  },
  {
    slug: "hra-calculator", category: "finance", live: true,
    title: "HRA Calculator", h1: "HRA Exemption Calculator",
    desc: "Free online HRA exemption calculator under Section 10(13A). Find your tax-exempt and taxable House Rent Allowance using the 3-way rule for metro and non-metro cities.",
    faqs: [
      { q: "How is HRA exemption calculated under Section 10(13A)?", a: "The exempt amount is the minimum of three figures: the actual HRA received, 50% of (Basic + DA) if you live in a metro city (40% if non-metro), and the annual rent paid minus 10% of (Basic + DA). Whichever of these three is smallest is your tax-exempt HRA; the rest of the HRA received is taxable." },
      { q: "Which cities count as metro for HRA?", a: "Only Delhi, Mumbai, Kolkata and Chennai are treated as metro cities for HRA, allowing the 50% of Basic + DA limit. All other cities, including Bengaluru, Hyderabad and Pune, use the 40% limit." },
    ],
    guide: { slug: "how-is-hra-exemption-calculated", title: "How Is HRA Exemption Calculated?" },
  },

  // ---- PDF ----
  {
    slug: "merge-pdf", category: "pdf", live: true,
    guide: { slug: "how-to-merge-pdf-files", title: "How to Merge PDF Files" },
    title: "Merge PDF", h1: "Merge PDF Files",
    desc: "Merge PDF files into one online for free. Combine multiple PDFs, reorder them before merging, and download — fully in your browser, nothing uploaded.",
    faqs: [
      { q: "Can I choose the order the PDFs are combined in?", a: "Yes. After selecting your files, use the Up and Down buttons to arrange them. The merged PDF follows the order shown in the list." },
      { q: "Is there a limit on how many PDFs I can merge?", a: "No fixed limit. Because everything runs in your browser, the only constraint is your device's memory, so very large files may take a moment." },
      { q: "Are my PDFs uploaded to a server?", a: "No. Merging happens entirely in your browser using your own device — your files never leave your computer." },
    ],
  },
  {
    slug: "split-pdf", category: "pdf", live: true,
    guide: { slug: "how-to-split-a-pdf", title: "How to Split a PDF" },
    title: "Split PDF", h1: "Split PDF",
    desc: "Split a PDF online for free. Extract specific pages or page ranges into a new PDF and download — runs entirely in your browser, no upload.",
    faqs: [
      { q: "How do I choose which pages to keep?", a: "Enter pages and ranges separated by commas, like 1-3, 5, 8-10. The new PDF contains exactly those pages in order, with duplicates removed." },
      { q: "Can I pull a single page out of a PDF?", a: "Yes. Just enter that one page number, for example 4, and download a one-page PDF with only that page." },
      { q: "Is my PDF uploaded anywhere?", a: "No. Splitting runs entirely in your browser — your document never leaves your device." },
    ],
  },
  {
    slug: "compress-pdf", category: "pdf", live: true,
    guide: { slug: "how-to-compress-a-pdf", title: "How to Compress a PDF" },
    title: "Compress PDF", h1: "Compress PDF",
    desc: "Compress PDF files online for free to reduce file size. Shrink large, scanned or image-heavy PDFs in your browser and see the size saved — nothing uploaded.",
    faqs: [
      { q: "How does the compression work?", a: "Each page is re-rendered as an optimised JPEG image and rebuilt into a new PDF. You pick a quality level and see the before and after size, so you can balance size against sharpness." },
      { q: "Why does it work best on scanned documents?", a: "Because pages are turned into images, selectable text becomes part of the picture. That gives big savings on scans and image-heavy PDFs, but plain-text PDFs may not shrink much and will lose selectable text." },
      { q: "Is my PDF uploaded to a server?", a: "No. Compression happens entirely in your browser — your file never leaves your device." },
    ],
  },
  {
    slug: "pdf-to-jpg", category: "pdf", live: true,
    guide: { slug: "how-to-convert-pdf-to-jpg", title: "How to Convert PDF to JPG" },
    title: "PDF to JPG", h1: "PDF to JPG Converter",
    desc: "Convert PDF to JPG or PNG images online for free. Turn every page into a high-quality image and download — fast, private, and entirely in your browser.",
    faqs: [
      { q: "Does it convert every page?", a: "Yes. Each page of your PDF is rendered to its own image file and downloaded, named by page number so they stay in order." },
      { q: "Can I control the image quality?", a: "Yes. Choose a resolution from 1x to 4x. Higher resolution gives sharper images and larger files — 2x suits most screens, 3-4x is better for printing." },
      { q: "Is my PDF uploaded anywhere?", a: "No. The conversion runs entirely in your browser — your document never leaves your device." },
    ],
  },
  {
    slug: "jpg-to-pdf", category: "pdf", live: true,
    guide: { slug: "how-to-convert-jpg-to-pdf", title: "How to Convert JPG to PDF" },
    title: "JPG to PDF", h1: "JPG to PDF Converter",
    desc: "Convert JPG and PNG images to a PDF online for free. Combine multiple photos into one PDF, set the order, and download — all in your browser, no upload.",
    faqs: [
      { q: "Can I add more than one image?", a: "Yes. Add as many JPG or PNG images as you like. Each becomes a page, and you can reorder them with the Up and Down buttons before creating the PDF." },
      { q: "What is the difference between 'Fit to A4' and 'Page matches image'?", a: "'Fit to A4' centres each image on a standard A4 page with margins, good for printing. 'Page matches image' makes each page exactly the size of its image, with no surrounding whitespace." },
      { q: "Are my images uploaded to a server?", a: "No. The PDF is built entirely in your browser — your images never leave your device." },
    ],
  },
  {
    slug: "rotate-pdf", category: "pdf", live: true,
    title: "Rotate PDF", h1: "Rotate PDF",
    desc: "Rotate PDF pages online for free. Turn every page 90, 180 or 270 degrees and download the corrected PDF — instant, private, and fully in your browser.",
    faqs: [
      { q: "Does it rotate all pages or just one?", a: "It rotates every page in the document by the angle you choose. The rotation is added to each page's existing orientation, so a sideways scan can be set upright in one step." },
      { q: "Will rotating reduce the quality of my PDF?", a: "No. Rotation only changes the page orientation flag — the underlying text and images are untouched, so there is no loss of quality." },
      { q: "Is my PDF uploaded anywhere?", a: "No. Rotation runs entirely in your browser — your document never leaves your device." },
    ],
  },
  {
    slug: "unlock-pdf", category: "pdf", live: true,
    title: "Unlock PDF", h1: "Unlock PDF",
    desc: "Unlock a PDF online for free by removing owner restrictions on printing, copying and editing from a file you own — runs in your browser, nothing uploaded.",
    faqs: [
      { q: "What kind of locks can this remove?", a: "It removes owner-level restrictions such as no-printing, no-copying and no-editing permissions from a PDF that opens without a password." },
      { q: "Can it open a PDF that asks for a password to view it?", a: "No. If a PDF needs a password just to open, that password is required to decrypt it, and this tool cannot bypass it. Use it only on documents you are authorised to unlock." },
      { q: "Is my PDF uploaded to a server?", a: "No. Unlocking happens entirely in your browser — your file never leaves your device." },
    ],
  },
  {
    slug: "watermark-pdf", category: "pdf", live: true,
    title: "Watermark PDF", h1: "Add a Watermark to a PDF",
    desc: "Add a text watermark to a PDF online for free. Stamp every page with custom text at the opacity and size you choose, then download — all in your browser.",
    faqs: [
      { q: "Can I change how the watermark looks?", a: "Yes. Type any text, then adjust the opacity and font size with the sliders. The watermark is placed diagonally across the centre of every page." },
      { q: "Does the watermark go on all pages?", a: "Yes. The text you enter is stamped onto every page of the PDF in one step." },
      { q: "Is my PDF uploaded anywhere?", a: "No. The watermark is applied entirely in your browser — your document never leaves your device." },
    ],
  },
  {
    slug: "pdf-to-word", category: "pdf", live: true,
    guide: { slug: "how-to-convert-pdf-to-word", title: "How to Convert PDF to Word" },
    title: "PDF to Word", h1: "PDF to Word Converter",
    desc: "Convert PDF to Word (DOCX) online for free. Extract the text into an editable Word document you can open in Word, Google Docs or Pages — all in your browser, nothing uploaded.",
    faqs: [
      { q: "Will the Word file keep the exact layout of my PDF?", a: "It extracts the text into a clean, editable DOCX rather than pixel-matching the original layout. You choose whether to merge lines into flowing paragraphs or keep each line separate, which suits letters, articles and reports you want to re-edit." },
      { q: "Can it convert a scanned PDF?", a: "No. A scan is a picture of text with no selectable characters, so there is nothing to extract. This converter works on digital PDFs that contain real text — the kind where you can select and copy words in a PDF reader." },
      { q: "Is my PDF uploaded to a server?", a: "No. The text is extracted and the Word file is built entirely in your browser — your document never leaves your device." },
    ],
  },
  {
    slug: "pdf-to-excel", category: "pdf", live: true,
    guide: { slug: "how-to-extract-tables-from-pdf-to-excel", title: "How to Extract Tables from a PDF to Excel" },
    title: "PDF to Excel", h1: "PDF to Excel & CSV Converter",
    desc: "Extract tables from a PDF to Excel (XLSX) or CSV online for free. Detects rows and columns automatically, previews the table, and downloads a spreadsheet — all in your browser, no upload.",
    faqs: [
      { q: "How does it know where the columns are?", a: "It reads the position of every piece of text on the page, groups text into rows by vertical position, and detects columns from the vertical gaps that run down the page. You see a live preview so you can check the result before downloading." },
      { q: "Should I download XLSX or CSV?", a: "Choose Excel (XLSX) to open straight in Excel, Google Sheets or Numbers with numbers kept as numbers. Choose CSV for a plain, universal text file you can import anywhere — you can also pick the delimiter (comma, semicolon or tab)." },
      { q: "Does it work on scanned PDFs?", a: "No. Extraction needs real, selectable text. Scanned pages are images, so there is nothing to read. It works best on digital PDFs — statements, invoices and reports — with clearly separated rows and columns." },
    ],
  },

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
    guide: { slug: "png-vs-jpg-vs-webp", title: "PNG vs JPG vs WebP" },
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
    guide: { slug: "how-to-make-a-passport-photo-at-home", title: "How to Make a Passport Photo at Home" },
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
