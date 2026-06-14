"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",
  "eighty", "ninety",
];
// Short-scale group names, ascending. Index 0 is the units group.
const SCALES = [
  "", "thousand", "million", "billion", "trillion", "quadrillion",
  "quintillion",
];

// Convert an integer from 0-999 into words.
function threeDigitsToWords(n) {
  const parts = [];
  if (n >= 100) {
    parts.push(ONES[Math.floor(n / 100)], "hundred");
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)]);
    n %= 10;
    if (n > 0) parts.push(ONES[n]);
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

// Convert a non-negative integer string (digits only) into words.
function integerToWords(digits) {
  // Strip leading zeros but keep a single zero.
  digits = digits.replace(/^0+(?=\d)/, "");
  if (digits === "0") return "zero";

  // Break into groups of three from the right.
  const groups = [];
  for (let i = digits.length; i > 0; i -= 3) {
    groups.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  if (groups.length - 1 >= SCALES.length) return null; // too large to name

  const words = [];
  groups.forEach((g, idx) => {
    const value = parseInt(g, 10);
    if (value === 0) return;
    const scale = SCALES[groups.length - 1 - idx];
    words.push(threeDigitsToWords(value) + (scale ? " " + scale : ""));
  });
  return words.join(" ");
}

function numberToWords(raw) {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: "", error: false };

  // Allow an optional sign, digits, and one optional decimal part.
  const m = trimmed.replace(/,/g, "").match(/^([+-]?)(\d+)(?:\.(\d+))?$/);
  if (!m) {
    return { value: "", error: true };
  }
  const [, sign, intPart, decPart] = m;

  const intWords = integerToWords(intPart);
  if (intWords === null) {
    return { value: "", error: true };
  }

  let result = intWords;
  if (decPart && /[1-9]/.test(decPart)) {
    const spoken = decPart.split("").map((d) => ONES[Number(d)]).join(" ");
    result += " point " + spoken;
  } else if (decPart !== undefined && decPart.length > 0) {
    // Decimal part of all zeros: speak it for clarity if the user typed it.
    if (/^0+$/.test(decPart)) {
      result += " point " + decPart.split("").map(() => ONES[0]).join(" ");
    }
  }

  if (sign === "-") result = "negative " + result;

  // Capitalize the first letter.
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return { value: result, error: false };
}

export default function NumberToWords() {
  const [input, setInput] = useState("");

  const output = useMemo(() => numberToWords(input), [input]);

  return (
    <div>
      <label className="field">
        <span className="field-label">Number</span>
        <input
          className="inp mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 1234567.89"
          aria-label="Number to convert to words"
          inputMode="decimal"
        />
      </label>
      {output.error ? (
        <p className="error">Enter a valid number, for example 1234 or -56.7.</p>
      ) : (
        <OutputBox value={output.value} mono={false} />
      )}
      <p className="muted small">
        Uses the short scale (thousand, million, billion). Decimal digits are
        read out individually after &quot;point&quot;.
      </p>
    </div>
  );
}
