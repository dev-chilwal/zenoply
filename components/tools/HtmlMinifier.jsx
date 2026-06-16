"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

// Tags whose contents must be preserved verbatim (whitespace matters).
const RAW_TAGS = ["pre", "textarea", "script", "style"];

// Split the HTML into a sequence of segments, isolating comments and the
// contents of raw tags so collapsing whitespace never touches them.
function tokenize(html) {
  const re = new RegExp(
    "(<!--[\\s\\S]*?-->)|(<(pre|textarea|script|style)\\b[^>]*>[\\s\\S]*?<\\/\\3>)",
    "gi"
  );
  const segs = [];
  let last = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) segs.push({ type: "html", text: html.slice(last, m.index) });
    if (m[1] !== undefined) segs.push({ type: "comment", text: m[1] });
    else segs.push({ type: "raw", text: m[2] });
    last = re.lastIndex;
  }
  if (last < html.length) segs.push({ type: "html", text: html.slice(last) });
  return segs;
}

function minify(html, { removeComments }) {
  const segs = tokenize(html);
  let out = "";
  for (const seg of segs) {
    if (seg.type === "raw") {
      out += seg.text;
    } else if (seg.type === "comment") {
      // Always keep conditional comments (<!--[if ...]>); drop the rest if asked.
      if (!removeComments || /^<!--\[if/i.test(seg.text)) out += seg.text;
    } else {
      // Collapse runs of whitespace to a single space, then drop whitespace
      // that sits between two tags.
      let t = seg.text.replace(/\s+/g, " ");
      t = t.replace(/>\s+</g, "><");
      // Trim a space against an adjacent tag boundary so whitespace between a
      // normal tag and a raw/comment block (kept in separate segments) is also
      // removed.
      if (/>$/.test(out) && /^ </.test(t)) t = t.slice(1);
      out += t;
    }
  }
  out = out.replace(/> +</g, "><");
  return out.trim();
}

export default function HtmlMinifier() {
  const [input, setInput] = useState("");
  const [removeComments, setRemoveComments] = useState(true);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return minify(input, { removeComments });
    } catch {
      return "";
    }
  }, [input, removeComments]);

  const saved = input.length && output.length ? input.length - output.length : 0;
  const pct = input.length ? Math.round((saved / input.length) * 100) : 0;

  return (
    <div>
      <label className="field">
        <span className="field-label">HTML to minify</span>
        <textarea
          className="inp mono"
          rows={8}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"<div class=\"box\">\n  <p>Hello   world</p>\n</div>"}
        />
      </label>
      <label className="check-row">
        <input type="checkbox" checked={removeComments} onChange={(e) => setRemoveComments(e.target.checked)} />
        <span>Remove comments (keeps conditional comments)</span>
      </label>
      <p className="muted small">Collapses whitespace and removes the gaps between tags. The contents of pre, textarea, script and style tags are preserved exactly.</p>
      {output && (
        <p className="muted small">Reduced from {input.length} to {output.length} characters, saving {saved} ({pct}%).</p>
      )}
      <OutputBox value={output} downloadName="minified.html" mimeType="text/html" />
    </div>
  );
}
