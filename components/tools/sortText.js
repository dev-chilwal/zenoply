// Sorting logic kept out of the component so it can be exercised in node
// against Intl.Collator directly — the same reasoning as htmlFormat.js,
// xmlFormat.js and jsonYaml.js.
//
// Three decisions shape this file, and the first one is the whole tool:
//
//  1. **The default sort is a collation, not a comparison of character codes.**
//     `["Banana", "apple"].sort()` returns `["Banana", "apple"]`, because a
//     bare `Array.prototype.sort` compares UTF-16 code units and every ASCII
//     capital sits below every ASCII lowercase letter. The same rule files
//     "item10" before "item9" and drops "Ärger" past "Zug". None of that is
//     alphabetical order in any language, so alphabetical mode goes through
//     `Intl.Collator`, which is the platform's implementation of real
//     dictionary order. Code-point order is still offered, but as its own
//     explicitly named mode, because it is what a shell `sort` under LC_ALL=C
//     or a database `ORDER BY` on a binary collation will give you and matching
//     that is sometimes the actual goal.
//  2. **Descending negates the comparator; it does not reverse the array.**
//     Array.prototype.sort has been stable since ES2019, so items the
//     comparator calls equal keep their input order. Negating preserves that —
//     reversing the finished array would also flip those ties, so two lines
//     that differ only in case would silently swap when you changed direction.
//  3. **Options that decide what is *compared* never change what is *emitted*.**
//     Ignoring case, ignoring a leading "The", or reading a number out of a
//     line all build a sort key; the line itself is copied through untouched.
//     The only options that alter content are the ones that say so — trimming,
//     dropping blanks and removing duplicates.

// A leading article is stripped from the sort key only, so "The Godfather"
// files under G while still printing as "The Godfather".
const LEADING_ARTICLE = /^(?:the|a|an)\s+/i;

// First number in a line: optional sign, digits with optional thousands commas,
// optional decimal part. Matches "-1,200.50" in "Rent: -1,200.50 due".
const FIRST_NUMBER = /-?\d[\d,]*(?:\.\d+)?/;

// Split the input into items. Line mode is the normal case; comma mode exists
// because a list pasted out of a sentence or a spreadsheet cell arrives as
// "banana, apple, cherry" and would otherwise sort as a single item.
function splitItems(text, separator) {
  if (separator === "comma") {
    return text.split(/,/).map((s) => s.trim());
  }
  return text.split(/\r\n|\r|\n/);
}

function joinItems(items, separator) {
  return separator === "comma" ? items.join(", ") : items.join("\n");
}

// The string actually handed to the collator. It is always trimmed, even when
// "trim each line" is off and the line is emitted with its spacing intact —
// otherwise every indented line would cluster together under the space
// character instead of sorting by the word a reader actually sees.
function sortKey(item, { ignoreArticles }) {
  const key = item.trim();
  return ignoreArticles ? key.replace(LEADING_ARTICLE, "") : key;
}

function numberIn(item) {
  const m = item.match(FIRST_NUMBER);
  if (!m) return null;
  const n = Number(m[0].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

// Fisher-Yates. `random` is injectable so the shuffle can be tested.
function shuffle(items, random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Sort a block of text line by line (or item by item, for a comma-separated
 * list).
 *
 * @param {string} text
 * @param {object} opts
 *   separator        "line" | "comma"
 *   mode             "alpha" | "codepoint" | "number" | "length" | "shuffle" | "reverse"
 *   direction        "asc" | "desc"          (ignored by shuffle and reverse)
 *   natural          compare digit runs as numbers, so item9 < item10
 *   caseSensitive    distinguish "Apple" from "apple"
 *   trim             strip leading/trailing spaces from each item
 *   removeBlank      drop blank items
 *   removeDuplicates keep only the first of each repeated item
 *   ignoreArticles   ignore a leading "The"/"A"/"An" when comparing
 *   locale           BCP 47 tag driving the collation
 *   random           RNG for shuffle mode, defaults to Math.random
 * @returns {{ items: string[], text: string, stats: object }}
 */
export function sortLines(text, opts = {}) {
  const {
    separator = "line",
    mode = "alpha",
    direction = "asc",
    natural = true,
    caseSensitive = false,
    trim = true,
    removeBlank = true,
    removeDuplicates = false,
    ignoreArticles = false,
    locale = "en",
    random = Math.random,
  } = opts;

  const raw = splitItems(text, separator);
  const inputCount = raw.length;

  // Comma mode has already trimmed: an item there is never meaningfully
  // surrounded by spaces.
  let items = trim || separator === "comma" ? raw.map((s) => s.trim()) : raw;

  let blank = 0;
  if (removeBlank) {
    const kept = items.filter((s) => s.trim() !== "");
    blank = items.length - kept.length;
    items = kept;
  }

  let duplicate = 0;
  if (removeDuplicates) {
    // Deduplication follows the same case rule as the sort, so a
    // case-insensitive sort also treats "Apple" and "apple" as one item.
    const seen = new Set();
    const kept = [];
    for (const item of items) {
      const key = caseSensitive ? item.trim() : item.trim().toLowerCase();
      if (seen.has(key)) {
        duplicate++;
        continue;
      }
      seen.add(key);
      kept.push(item);
    }
    items = kept;
  }

  const sign = direction === "desc" ? -1 : 1;
  let sorted;
  let unnumbered = 0;

  if (mode === "shuffle") {
    sorted = shuffle(items, random);
  } else if (mode === "reverse") {
    sorted = items.slice().reverse();
  } else if (mode === "number") {
    // Lines carrying no number cannot be placed on a number line at all, so
    // they are held out and appended in input order rather than being given a
    // fake value that would scatter them through the result.
    const numbered = [];
    const rest = [];
    for (const item of items) {
      const n = numberIn(item);
      if (n === null) rest.push(item);
      else numbered.push({ item, n });
    }
    unnumbered = rest.length;
    numbered.sort((a, b) => sign * (a.n - b.n));
    sorted = numbered.map((x) => x.item).concat(rest);
  } else if (mode === "length") {
    // Length in code points, not UTF-16 units, so an emoji or an astral
    // character counts once. Ties fall back to the collator so the result is
    // deterministic and reads sensibly instead of depending on input order.
    const collator = new Intl.Collator(locale, {
      numeric: natural,
      sensitivity: caseSensitive ? "variant" : "accent",
    });
    const len = (s) => Array.from(s.trim()).length;
    sorted = items
      .slice()
      .sort((a, b) => sign * (len(a) - len(b) || collator.compare(sortKey(a, { ignoreArticles }), sortKey(b, { ignoreArticles }))));
  } else if (mode === "codepoint") {
    // Deliberately ignores the case and article options: this mode exists to
    // reproduce what a byte-order sort elsewhere produced, so anything that
    // quietly rewrote the key would defeat the point of asking for it.
    sorted = items
      .slice()
      .sort((a, b) => {
        const x = a.trim();
        const y = b.trim();
        return sign * (x < y ? -1 : x > y ? 1 : 0);
      });
  } else {
    const collator = new Intl.Collator(locale, {
      numeric: natural,
      sensitivity: caseSensitive ? "variant" : "accent",
    });
    sorted = items
      .slice()
      .sort((a, b) =>
        sign * collator.compare(sortKey(a, { ignoreArticles }), sortKey(b, { ignoreArticles }))
      );
  }

  return {
    items: sorted,
    text: joinItems(sorted, separator),
    stats: { input: inputCount, output: sorted.length, blank, duplicate, unnumbered },
  };
}
