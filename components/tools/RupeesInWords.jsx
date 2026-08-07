"use client";
import { useMemo, useState } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented, Rows, Row } from "@/components/calc/Calc";
import { parseAmount, amountWordings } from "@/components/tools/rupeesWords";

export default function RupeesInWords() {
  const [amount, setAmount] = useState("123456.50");
  const [system, setSystem] = useState("indian"); // indian | intl

  const parsed = useMemo(() => parseAmount(amount), [amount]);
  const words = useMemo(
    () => (parsed.ok ? amountWordings(parsed.rupees, parsed.paise, system) : null),
    [parsed, system]
  );

  return (
    <div>
      <Segmented
        ariaLabel="Numbering system"
        value={system}
        onChange={setSystem}
        options={[
          { value: "indian", label: "Indian (lakh, crore)" },
          { value: "intl", label: "International (million, billion)" },
        ]}
      />

      <label className="field">
        <span className="field-label">Amount in rupees</span>
        <input
          className="inp mono"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1,23,456.50"
          aria-label="Amount in rupees"
          inputMode="decimal"
        />
      </label>
      <p className="muted small">
        Type the amount the way you would write it in figures — the rupee symbol, &ldquo;Rs.&rdquo;
        and commas in either grouping style are all accepted. Digits after the decimal point are
        treated as paise.
      </p>

      {parsed.error && <p className="error">{parsed.error}</p>}

      {words && (
        <>
          {parsed.rounded && (
            <p className="muted small">
              Rounded to the nearest paisa — a rupee amount cannot carry more than two decimal
              places.
            </p>
          )}

          <div style={{ marginTop: "1.5rem" }}>
            <span className="field-label">On a cheque</span>
            <OutputBox value={words.cheque} mono={false} />
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            <span className="field-label">In an invoice or contract</span>
            <OutputBox value={words.invoice} mono={false} />
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            <span className="field-label">The number alone, without currency</span>
            <OutputBox value={words.words} mono={false} />
          </div>

          <Rows>
            <Row label="In figures" val={`₹${words.figures}`} highlight />
            <Row label="Rupees" val={words.figures.split(".")[0]} />
            <Row label="Paise" val={String(parsed.paise)} />
          </Rows>
        </>
      )}

      <p className="muted small" style={{ marginTop: "1rem" }}>
        {system === "indian"
          ? "Indian system: 1 lakh = 1,00,000 and 1 crore = 1,00,00,000, with commas every two digits above the last three. Above a crore the words repeat, so 10,00,00,00,000 reads as one thousand crore."
          : "International short scale: thousand, million, billion, trillion, with commas every three digits. Use this for amounts written for readers outside South Asia."}
      </p>
      <p className="muted small">
        Compound numbers from twenty-one to ninety-nine are hyphenated, as standard written English
        requires. Section 18 of the Negotiable Instruments Act, 1881 provides that where the amount
        in words and the amount in figures differ, the amount in words is the one payable — though
        in practice a bank is more likely to return the cheque than to pay either.
      </p>
    </div>
  );
}
