// Short mono tags shown on the category-landing tool cards. Presentation only.
export const TOOL_TAGS = {
  // finance
  "sip-calculator": "SIP",
  "step-up-sip-calculator": "SIP↑",
  "emi-calculator": "EMI",
  "gst-calculator": "GST",
  "fd-calculator": "FD",
  "compound-interest-calculator": "CI",
  "mortgage-calculator": "MTG",
  "percentage-calculator": "%",
  "income-tax-calculator": "TAX",
  "in-hand-salary-calculator": "CTC",
  "ppf-calculator": "PPF",
  "rd-calculator": "RD",
  "lumpsum-calculator": "LUMP",
  "swp-calculator": "SWP",
  "cagr-calculator": "CAGR",
  "roi-calculator": "ROI",
  "simple-interest-calculator": "SI",
  "inflation-calculator": "INFL",
  "nps-calculator": "NPS",
  "gratuity-calculator": "GRAT",
  "hra-calculator": "HRA",
  // text
  "word-counter": "WORDS",
  "case-converter": "CASE",
  "remove-line-breaks": "LINES",
  "remove-duplicate-lines": "DEDUP",
  "find-and-replace": "F&R",
  "lorem-ipsum-generator": "LOREM",
  "slug-generator": "SLUG",
  "text-reverser": "REV",
  // dev
  "base64-encoder": "B64",
  "url-encoder": "URL",
  "uuid-generator": "UUID",
  "hash-generator": "HASH",
  "json-formatter": "JSON",
  "sql-formatter": "SQL",
  "jwt-decoder": "JWT",
  "html-minifier": "HTML",
  "csv-to-json": "CSV",
  "json-to-csv": "J→C",
  "yaml-to-json": "YAML",
  // convert
  "color-converter": "COLOR",
  "hex-to-rgb": "HEX",
  "rgb-to-hex": "RGB",
  "epoch-converter": "EPOCH",
  "number-to-words": "NUM",
  // image
  "image-resizer": "SIZE",
  "image-converter": "CONV",
  "image-compressor": "ZIP",
  "passport-photo-maker": "PHOTO",
  // pdf
  "merge-pdf": "MERGE",
  "split-pdf": "SPLIT",
  "compress-pdf": "ZIP",
  "pdf-to-jpg": "JPG",
  "jpg-to-pdf": "PDF",
  "rotate-pdf": "ROT",
  "unlock-pdf": "UNLK",
  "watermark-pdf": "MARK",
};

// Tag for a tool, with an initials fallback for anything not mapped above.
export function tagFor(tool) {
  return (
    TOOL_TAGS[tool.slug] ||
    tool.title
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 4)
      .toUpperCase()
  );
}
