"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

// Turn any title into a URL-friendly slug.
// 1. Unicode-normalize and strip combining marks (cafe from cafe + accent),
//    using escaped ranges so source stays plain ASCII.
// 2. Lowercase (optional), replace every run of non-alphanumerics
//    with the separator, and trim leading/trailing separators.
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(input, separator, lowercase) {
  let s = input.normalize("NFKD").replace(COMBINING_MARKS, "");
  if (lowercase) s = s.toLowerCase();
  s = s.replace(/[^a-zA-Z0-9]+/g, separator);
  const sep = separator === "-" ? "-" : "_";
  s = s.replace(new RegExp("^[" + sep + "]+|[" + sep + "]+$", "g"), "");
  return s;
}

export default function SlugGenerator() {
  const [text, setText] = useState("");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);

  const slug = useMemo(
    () => (text ? slugify(text, separator, lowercase) : ""),
    [text, separator, lowercase]
  );

  return (
    <div>
      <label className="field">
        <span className="field-label">Title or text</span>
        <textarea
          className="inp"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. 10 Tips for Writing Better Headlines!"
        />
      </label>
      <div className="btn-row">
        <button className={"btn" + (separator === "-" ? "" : " btn-ghost")} onClick={() => setSeparator("-")}>
          Hyphen (-)
        </button>
        <button className={"btn" + (separator === "_" ? "" : " btn-ghost")} onClick={() => setSeparator("_")}>
          Underscore (_)
        </button>
      </div>
      <label className="check-row">
        <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} />
        <span>Convert to lowercase</span>
      </label>
      {slug ? (
        <OutputBox value={slug} downloadName="slug.txt" />
      ) : (
        <p className="muted small">Type a title above and the slug appears here instantly.</p>
      )}
    </div>
  );
}
