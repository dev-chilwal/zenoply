"use client";
import { useState, useCallback } from "react";
import OutputBox from "@/components/OutputBox";

// RFC 4122 v4 UUID. Uses native crypto.randomUUID where available, with a
// crypto.getRandomValues fallback for older browsers.
function uuidv4() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0"));
  return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`;
}

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  const [list, setList] = useState(() => Array.from({ length: 5 }, uuidv4));

  const generate = useCallback(() => {
    const n = Math.min(Math.max(parseInt(count, 10) || 1, 1), 1000);
    setList(Array.from({ length: n }, uuidv4));
  }, [count]);

  const text = (upper ? list.map((u) => u.toUpperCase()) : list).join("\n");

  return (
    <div>
      <div className="input-row">
        <label className="field" style={{ flex: "0 0 auto" }}>
          <span className="field-label">How many</span>
          <input
            className="inp"
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            style={{ width: "7rem" }}
          />
        </label>
        <button className="btn" onClick={generate}>Generate</button>
      </div>
      <label className="check-row">
        <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
        <span>Uppercase</span>
      </label>
      <OutputBox value={text} downloadName="uuids.txt" />
    </div>
  );
}
