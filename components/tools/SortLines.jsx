"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Field } from "@/components/calc/Calc";
import { sortLines } from "@/components/tools/sortText";

// The comparators live in sortText.js so they can be exercised in node against
// Intl.Collator directly; this file is only the form around them.

const SAMPLE = "banana\nApple\nitem10\nitem9\ncherry";

// Kept short on purpose: these are the collations whose answers actually differ
// from English for the scripts most visitors paste. Everything else is served
// by the browser's own language.
const LOCALES = [
  { value: "en", label: "English (A-Z)" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "sv", label: "Swedish" },
  { value: "pl", label: "Polish" },
  { value: "tr", label: "Turkish" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese (pinyin)" },
];

export default function SortLines() {
  const [text, setText] = useState("");
  const [separator, setSeparator] = useState("line");
  const [mode, setMode] = useState("alpha");
  const [direction, setDirection] = useState("asc");
  const [locale, setLocale] = useState("en");
  const [natural, setNatural] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [ignoreArticles, setIgnoreArticles] = useState(false);

  const ordered = mode !== "shuffle" && mode !== "reverse";
  const collated = mode === "alpha" || mode === "length";

  const { text: result, stats } = useMemo(() => {
    if (!text.trim()) return { text: "", stats: null };
    return sortLines(text, {
      separator, mode, direction, locale, natural, caseSensitive,
      removeDuplicates, ignoreArticles,
    });
  }, [text, separator, mode, direction, locale, natural, caseSensitive, removeDuplicates, ignoreArticles]);

  const ascLabel = mode === "length" ? "Shortest first" : mode === "number" ? "Smallest first" : "A to Z";
  const descLabel = mode === "length" ? "Longest first" : mode === "number" ? "Largest first" : "Z to A";

  return (
    <div>
      <label className="field">
        <span className="field-label">Your list</span>
        <textarea
          className="ta mono"
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={SAMPLE}
          spellCheck={false}
        />
      </label>

      <div className="field-row">
        <Field label="Items are separated by">
          <select className="inp" value={separator} onChange={(e) => setSeparator(e.target.value)}>
            <option value="line">One per line</option>
            <option value="comma">Commas</option>
          </select>
        </Field>
        <Field label="Sort by">
          <select className="inp" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="alpha">Alphabetical</option>
            <option value="number">Number in the line</option>
            <option value="length">Line length</option>
            <option value="codepoint">Code point (exact)</option>
            <option value="reverse">Reverse current order</option>
            <option value="shuffle">Random shuffle</option>
          </select>
        </Field>
        {ordered && (
          <Field label="Direction">
            <select className="inp" value={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="asc">{ascLabel}</option>
              <option value="desc">{descLabel}</option>
            </select>
          </Field>
        )}
        {collated && (
          <Field label="Language">
            <select className="inp" value={locale} onChange={(e) => setLocale(e.target.value)}>
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {collated && (
        <>
          <label className="check-row">
            <input type="checkbox" checked={natural} onChange={(e) => setNatural(e.target.checked)} />
            <span>Read digits as numbers (item9 before item10)</span>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
            <span>Case sensitive</span>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={ignoreArticles} onChange={(e) => setIgnoreArticles(e.target.checked)} />
            <span>Ignore a leading &quot;The&quot;, &quot;A&quot; or &quot;An&quot; (files The Godfather under G)</span>
          </label>
        </>
      )}
      <label className="check-row">
        <input type="checkbox" checked={removeDuplicates} onChange={(e) => setRemoveDuplicates(e.target.checked)} />
        <span>Remove duplicates</span>
      </label>

      <p className="muted small">
        Alphabetical order uses your chosen language&apos;s real dictionary order, not the order of
        the underlying character codes — so apple comes before Banana, and an accented letter files
        with its plain form instead of after Z. Blank lines are dropped and each line is trimmed;
        nothing else about a line is changed. Need to strip repeats without reordering? Use{" "}
        <a href="/text/remove-duplicate-lines">Remove Duplicate Lines</a>.
      </p>

      {stats && (
        <p className="muted small">
          {stats.output} {stats.output === 1 ? "item" : "items"}
          {stats.blank > 0 && `, ${stats.blank} blank ${stats.blank === 1 ? "line" : "lines"} dropped`}
          {stats.duplicate > 0 && `, ${stats.duplicate} duplicate ${stats.duplicate === 1 ? "item" : "items"} removed`}
          {mode === "number" && stats.unnumbered > 0 &&
            `, ${stats.unnumbered} with no number moved to the end`}
          .
        </p>
      )}

      <OutputBox value={result} downloadName="sorted.txt" />
    </div>
  );
}
