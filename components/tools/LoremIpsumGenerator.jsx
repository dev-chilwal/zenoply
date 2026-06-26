"use client";
import { useState } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented } from "@/components/calc/Calc";

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et",
  "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis",
  "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea",
  "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur",
  "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt",
  "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est",
  "laborum", "at", "vero", "eos", "accusamus", "iusto", "odio", "dignissimos",
  "ducimus", "blanditiis", "praesentium", "voluptatum", "deleniti", "atque",
  "corrupti", "quos", "quas", "molestias", "excepturi", "obcaecati",
];

const OPENING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";

const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const randWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

function makeSentence() {
  const len = randInt(6, 12);
  const words = Array.from({ length: len }, randWord);
  const s = words.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

function makeParagraph() {
  return Array.from({ length: randInt(3, 6) }, makeSentence).join(" ");
}

function generate(unit, count, startClassic) {
  if (unit === "words") {
    const words = Array.from({ length: count }, randWord);
    if (startClassic) {
      const opening = OPENING.toLowerCase().replace(/,/g, "").split(" ");
      words.splice(0, Math.min(opening.length, count), ...opening.slice(0, count));
    }
    const s = words.join(" ");
    return s.charAt(0).toUpperCase() + s.slice(1) + ".";
  }
  if (unit === "sentences") {
    const sentences = Array.from({ length: count }, makeSentence);
    if (startClassic && count > 0) sentences[0] = OPENING + ".";
    return sentences.join(" ");
  }
  const paras = Array.from({ length: count }, makeParagraph);
  if (startClassic && count > 0) paras[0] = OPENING + ", " + paras[0].charAt(0).toLowerCase() + paras[0].slice(1);
  return paras.join("\n\n");
}

const UNITS = [
  { key: "paragraphs", label: "Paragraphs", max: 50 },
  { key: "sentences", label: "Sentences", max: 100 },
  { key: "words", label: "Words", max: 1000 },
];

export default function LoremIpsumGenerator() {
  const [unit, setUnit] = useState("paragraphs");
  const [count, setCount] = useState(3);
  const [startClassic, setStartClassic] = useState(true);
  const [output, setOutput] = useState("");

  const limit = UNITS.find((u) => u.key === unit).max;

  const run = () => {
    const n = Math.min(Math.max(1, Math.floor(Number(count) || 1)), limit);
    setCount(n);
    setOutput(generate(unit, n, startClassic));
  };

  return (
    <div>
      <Segmented ariaLabel="Unit" value={unit} onChange={setUnit}
        options={UNITS.map((u) => ({ value: u.key, label: u.label }))} />
      <label className="field">
        <span className="field-label">How many {unit}? (1-{limit})</span>
        <input
          className="inp"
          type="number"
          min={1}
          max={limit}
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={startClassic}
          onChange={(e) => setStartClassic(e.target.checked)}
        />
        <span>Start with &quot;Lorem ipsum dolor sit amet...&quot;</span>
      </label>
      <div className="btn-row">
        <button className="btn" onClick={run}>Generate</button>
      </div>
      <p className="muted small">Generated locally in your browser. Click Generate again for fresh text.</p>
      <OutputBox value={output} downloadName="lorem-ipsum.txt" mono={false} />
    </div>
  );
}
