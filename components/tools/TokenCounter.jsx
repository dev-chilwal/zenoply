"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import OutputBox from "@/components/OutputBox";

// Each BPE rank table is between 0.5 MB and 2.2 MB of plain JS, so an encoding
// is fetched only when a model that needs it is chosen, then kept for the rest
// of the session. o200k_base loads on first render because it is the default
// and also backs the reference count shown for the estimate-only models.
const ENCODINGS = {
  o200k_base: () => import("gpt-tokenizer/encoding/o200k_base"),
  cl100k_base: () => import("gpt-tokenizer/encoding/cl100k_base"),
  p50k_base: () => import("gpt-tokenizer/encoding/p50k_base"),
  r50k_base: () => import("gpt-tokenizer/encoding/r50k_base"),
};
const cache = {};
const loadEncoding = (name) => (cache[name] ||= ENCODINGS[name]());

// A model API never lets user content inject a control token, so "<|endoftext|>"
// typed into the box has to be counted as the eight ordinary tokens it spells.
// Left at its default, encode() throws on it instead.
const NO_SPECIALS = new Set();

// Exact entries name the tiktoken encoding, because that is the durable fact —
// model line-ups change, the encoding a line-up uses does not. Estimate entries
// are vendors with no published browser tokenizer.
const MODELS = [
  { key: "o200k_base", enc: "o200k_base", label: "o200k_base — GPT-5, GPT-4.1, GPT-4o, o-series" },
  { key: "cl100k_base", enc: "cl100k_base", label: "cl100k_base — GPT-4, GPT-3.5 Turbo, embeddings v3" },
  { key: "p50k_base", enc: "p50k_base", label: "p50k_base — text-davinci-002/003, Codex" },
  { key: "r50k_base", enc: "r50k_base", label: "r50k_base — GPT-3 base, GPT-2" },
  { key: "claude", vendor: "Anthropic", label: "Claude — Opus, Sonnet, Haiku", api: "Anthropic's /v1/messages/count_tokens endpoint" },
  { key: "gemini", vendor: "Google", label: "Gemini — Pro, Flash", api: "the Gemini API's countTokens method" },
  { key: "llama", vendor: "Meta", label: "Llama", api: "the tokenizer shipped with the model weights" },
  { key: "mistral", vendor: "Mistral", label: "Mistral", api: "Mistral's tokenizer library" },
  { key: "deepseek", vendor: "DeepSeek", label: "DeepSeek", api: "DeepSeek's published tokenizer files" },
];
const getModel = (key) => MODELS.find((m) => m.key === key) || MODELS[0];

// Drawing every chip for a novel-length paste would lock the tab up, and nobody
// reads past the first screen anyway — the count itself is always the full text.
const VIZ_LIMIT = 2500;

const CONTEXT_PRESETS = [4096, 8192, 16384, 32768, 128000, 200000, 1000000];

const fmt = (n) => n.toLocaleString("en-US");

// One TextDecoder fed token by token. A token whose bytes stop mid-codepoint
// (half an emoji) contributes "" and the next token flushes the whole
// character, so the pieces stay 1:1 with the ids and still join back to the
// original text — which is what makes the chip count trustworthy.
function tokenPieces(api, ids) {
  const slice = ids.length > VIZ_LIMIT ? ids.slice(0, VIZ_LIMIT) : ids;
  const core = api.default?.bytePairEncodingCoreProcessor;
  if (core && typeof core.tryDecodeToken === "function") {
    const dec = new TextDecoder();
    return slice.map((id) => {
      const bytes = core.tryDecodeToken(id);
      return typeof bytes === "string" ? bytes : dec.decode(bytes, { stream: true });
    });
  }
  // Fallback if that internal ever moves. api.decode carries its own streaming
  // decoder between calls, so it is only correct read in order from the start.
  return slice.map((id) => api.decode([id]));
}

export default function TokenCounter() {
  const [text, setText] = useState("");
  const [modelKey, setModelKey] = useState("o200k_base");
  const [contextSize, setContextSize] = useState(128000);
  const [pricePerM, setPricePerM] = useState("");
  const [showIds, setShowIds] = useState(false);

  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const model = getModel(modelKey);
  const encName = model.enc || "o200k_base";

  useEffect(() => {
    if (!text) { setResult(null); setBusy(false); return; }
    let cancelled = false;
    setBusy(true);
    // Debounced so a fast typist encodes once at the end of a word, not once
    // per keystroke; the work itself is synchronous once the ranks are in.
    const timer = setTimeout(() => {
      loadEncoding(encName).then((api) => {
        if (cancelled) return;
        const ids = api.encode(text, { disallowedSpecial: NO_SPECIALS });
        setResult({ ids, pieces: tokenPieces(api, ids) });
        setBusy(false);
      });
    }, 180);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [text, encName]);

  const chars = text.length;
  const words = useMemo(() => {
    const t = text.trim();
    return t ? t.split(/\s+/).length : 0;
  }, [text]);

  const exactCount = result ? result.ids.length : 0;
  // The rule of thumb every vendor's own docs reach for. It is a ratio, not a
  // tokenization, and the copy below says so rather than dressing it up.
  const estimate = Math.round(chars / 4);
  const count = model.enc ? exactCount : estimate;

  const contextPct = contextSize > 0 ? (count / contextSize) * 100 : 0;
  const price = parseFloat(pricePerM);
  const cost = Number.isFinite(price) && price > 0 ? (count / 1e6) * price : null;

  const idsText = useMemo(
    () => (result ? "[" + result.ids.join(", ") + "]" : ""),
    [result]
  );

  const loadSample = useCallback(() => {
    setText(
      "The quick brown fox jumps over the lazy dog.\n\n" +
        "Tokenizers split on sub-words, so uncommon words like \"antidisestablishmentarianism\" " +
        "cost several tokens while \" the\" costs one.\n\n" +
        'const total = items.reduce((sum, i) => sum + i.price, 0);\n\n' +
        "非英語のテキストは 1 文字あたりのトークン数が多くなります。"
    );
  }, []);

  return (
    <div>
      <div className="field-row">
        <label className="field">
          <span className="field-label">Model or encoding</span>
          <select className="inp" value={modelKey} onChange={(e) => setModelKey(e.target.value)}>
            <optgroup label="Exact count — OpenAI (tiktoken)">
              {MODELS.filter((m) => m.enc).map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </optgroup>
            <optgroup label="Estimate only — no public browser tokenizer">
              {MODELS.filter((m) => !m.enc).map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className="field">
          <span className="field-label">Context window</span>
          <select className="inp" value={contextSize} onChange={(e) => setContextSize(parseInt(e.target.value, 10))}>
            {CONTEXT_PRESETS.map((n) => (
              <option key={n} value={n}>{fmt(n)} tokens</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Price per 1M tokens (optional)</span>
          <input
            className="inp"
            type="number"
            min={0}
            step="0.01"
            value={pricePerM}
            onChange={(e) => setPricePerM(e.target.value)}
            placeholder="e.g. 3.00"
          />
        </label>
      </div>

      <label className="field">
        <span className="field-label">Your text</span>
        <textarea
          className="ta"
          rows={8}
          placeholder="Paste the prompt, document or code you want to measure…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>

      <div className="btn-row">
        <button className="btn btn-ghost btn-sm" onClick={loadSample}>Load sample text</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setText("")} disabled={!text}>Clear</button>
      </div>

      <div className="tok-count">
        <span className="tok-count-num">{busy && !result ? "…" : fmt(count)}</span>
        <span className="tok-count-label">
          {model.enc ? "tokens — exact" : "tokens — estimate only"}
        </span>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <span className="stat-num">{fmt(chars)}</span>
          <span className="stat-label">Characters</span>
        </div>
        <div className="stat">
          <span className="stat-num">{fmt(words)}</span>
          <span className="stat-label">Words</span>
        </div>
        <div className="stat">
          <span className="stat-num">{count > 0 ? (chars / count).toFixed(2) : "0"}</span>
          <span className="stat-label">Chars per token</span>
        </div>
        <div className="stat">
          <span className="stat-num">{contextPct < 0.1 && count > 0 ? "<0.1%" : contextPct.toFixed(1) + "%"}</span>
          <span className="stat-label">Of context window</span>
        </div>
      </div>

      <div className="tok-meter" role="img" aria-label={`${contextPct.toFixed(1)} percent of the context window used`}>
        <div
          className={"tok-meter-fill" + (contextPct > 100 ? " over" : "")}
          style={{ width: Math.min(contextPct, 100) + "%" }}
        />
      </div>
      <p className="muted small">
        {count > contextSize
          ? `${fmt(count - contextSize)} tokens over a ${fmt(contextSize)}-token window. Split the text or pick a larger window.`
          : `${fmt(contextSize - count)} tokens still free in a ${fmt(contextSize)}-token window. That budget covers the model's reply too, not just your prompt.`}
      </p>

      {cost !== null && (
        <p className="muted small">
          At ${price.toFixed(2)} per million tokens this text costs about <strong>${cost < 0.01 ? cost.toFixed(5) : cost.toFixed(4)}</strong> to send once.
        </p>
      )}

      {!model.enc && (
        <div className="tok-note">
          <p>
            <strong>{model.vendor} does not publish a tokenizer that runs in a browser</strong>, so the
            number above is characters ÷ 4 — a rule of thumb, not a real tokenization.
            For English prose it usually lands within about 10–20% of the truth. Code,
            JSON, and any non-Latin script can be off by far more, because those pack
            fewer characters into each token.
          </p>
          <p>
            For an exact figure, use {model.api}. As a sturdier reference point, the same
            text is {result ? <strong>{fmt(exactCount)} tokens</strong> : "—"} under
            OpenAI&apos;s o200k_base, which is a modern vocabulary of a broadly similar size.
          </p>
        </div>
      )}

      {result && result.ids.length > 0 && (
        <>
          <div className="tok-head">
            <span className="field-label" style={{ margin: 0 }}>
              {/* On an estimate-only model these chips are the o200k reference
                  split, not the vendor's own — saying so stops the chip count
                  from reading as a contradiction of the headline number. */}
              {model.enc ? "Token breakdown" : "Token breakdown — o200k_base reference"}
              {result.ids.length > VIZ_LIMIT && ` — first ${fmt(VIZ_LIMIT)} of ${fmt(result.ids.length)}`}
            </span>
            <button className="btn-sm" onClick={() => setShowIds((v) => !v)}>
              {showIds ? "Show text" : "Show token IDs"}
            </button>
          </div>

          {showIds ? (
            <OutputBox value={idsText} downloadName="token-ids.json" mimeType="application/json" />
          ) : (
            <div className="tok-viz">
              {result.pieces.map((piece, i) => (
                <span key={i} className={"tok tok-" + (i % 4)}>{piece}</span>
              ))}
            </div>
          )}
          {!showIds && (
            <p className="muted small">
              Each shaded run is one token. A thin sliver is a token that holds only part
              of a character — emoji and CJK text often split across two or three tokens,
              and the following one carries the whole character.
            </p>
          )}
        </>
      )}

      <p className="muted small">
        Counted in your browser with the same BPE tables OpenAI publishes for tiktoken —
        your prompt is never uploaded. Counts cover the text itself; a chat request also
        spends a few tokens per message on role and formatting overhead.
      </p>
    </div>
  );
}
