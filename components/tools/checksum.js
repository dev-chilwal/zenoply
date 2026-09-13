// File checksums, kept out of the component so every digest can be run in node
// against node:crypto and the published test vectors — the same reasoning as
// hmac.js, baseConvert.js and sortText.js.
//
// Five decisions shape this file:
//
//  1. **Every algorithm is written out as an incremental state, including the
//     three WebCrypto already has.** `crypto.subtle.digest` takes one
//     ArrayBuffer and there is no incremental WebCrypto API at all, so using it
//     means holding the whole file in memory. The canonical thing people came
//     here to do is check the SHA-256 of a 4 GB ISO against the line the distro
//     published, and allocating 4 GB to do it either fails outright or thrashes
//     the machine. Feeding fixed-size chunks into a Merkle-Damgard state keeps
//     memory flat at one chunk whatever the file size, which is the entire
//     reason this is not three lines of `subtle.digest`.
//  2. **One pass over the file feeds every algorithm at once.** Reading a 4 GB
//     file once per algorithm is four times the disk traffic for no benefit —
//     each chunk updates all the selected states before it is dropped.
//  3. **SHA-512 runs on 32-bit halves, not BigInt.** BigInt would be correct
//     and is unusably slow at this scale: 80 rounds of allocation per 128-byte
//     block. Hi/lo pairs of 32-bit ints stay on the integer path the JIT is
//     good at.
//  4. **The round constants are derived, not re-typed.** K is the first 32 (or
//     64) bits of the fractional part of the cube root of the nth prime, and H
//     the same for square roots. `floor(root(p) * 2^b)` is exactly the integer
//     kth root of `p << (b*(k-1)... )`, so BigInt reproduces the published
//     tables with no rounding and no chance of a transcription slip across 80
//     64-bit values. MD5 is the exception: its rounds are copied verbatim from
//     the already-verified construction in hmac.js rather than re-derived from
//     `sin`, whose last bit is not guaranteed identical across engines.
//  5. **CRC-32 is offered but is not a hash, and the copy says so.** It is here
//     because zip, gzip and PNG report one and people do come looking for it —
//     but it is a 4-byte error-detecting code that can be forged by hand, so it
//     answers "did this transfer cleanly", never "is this the file they
//     published".

import { crc32Update } from "./zip.js";
import { bytesToHex, hexToBytes, base64ToBytes, sameBytes } from "./hmac.js";

export { bytesToHex, sameBytes };

/* ------------------------------------------------------------- primes ---- */

function firstPrimes(n) {
  const out = [];
  for (let c = 2; out.length < n; c++) {
    let prime = true;
    for (const p of out) {
      if (p * p > c) break;
      if (c % p === 0) { prime = false; break; }
    }
    if (prime) out.push(c);
  }
  return out;
}

// floor(n ** (1/k)) for a BigInt n, by Newton descent from a power of two that
// is provably above the root.
function iroot(n, k) {
  if (n < 2n) return n;
  const K = BigInt(k);
  let x = 1n << (BigInt(n.toString(2).length) / K + 1n);
  for (;;) {
    const y = ((K - 1n) * x + n / x ** (K - 1n)) / K;
    if (y >= x) return x;
    x = y;
  }
}

// The first `bits` bits of the fractional part of p ** (1/k).
function rootFrac(p, k, bits) {
  const b = BigInt(bits);
  const scaled = BigInt(p) << (b * BigInt(k));
  return iroot(scaled, k) & ((1n << b) - 1n);
}

const P80 = /* @__PURE__ */ firstPrimes(80);

const sha256K = /* @__PURE__ */ (() =>
  Int32Array.from(P80.slice(0, 64), (p) => Number(BigInt.asIntN(32, rootFrac(p, 3, 32)))))();
const sha256H = /* @__PURE__ */ (() =>
  Int32Array.from(P80.slice(0, 8), (p) => Number(BigInt.asIntN(32, rootFrac(p, 2, 32)))))();

// SHA-512's 64-bit words, split into hi/lo 32-bit halves stored adjacently.
function split64(values) {
  const out = new Int32Array(values.length * 2);
  values.forEach((v, i) => {
    out[i * 2] = Number(BigInt.asIntN(32, v >> 32n));
    out[i * 2 + 1] = Number(BigInt.asIntN(32, v & 0xffffffffn));
  });
  return out;
}
const sha512K = /* @__PURE__ */ split64(P80.map((p) => rootFrac(p, 3, 64)));
const sha512H = /* @__PURE__ */ split64(P80.slice(0, 8).map((p) => rootFrac(p, 2, 64)));

/* -------------------------------------------------------- block engine ---- */

// Shared buffering: hold a partial block between updates, compress whole blocks
// straight out of the caller's array so a chunk is never copied twice.
class BlockHash {
  constructor(blockSize) {
    this.blockSize = blockSize;
    this.tail = new Uint8Array(blockSize);
    this.pos = 0;
    this.len = 0;
  }

  update(bytes) {
    const B = this.blockSize;
    this.len += bytes.length;
    let i = 0;
    if (this.pos) {
      const need = Math.min(B - this.pos, bytes.length);
      this.tail.set(bytes.subarray(0, need), this.pos);
      this.pos += need;
      i = need;
      if (this.pos === B) { this.compress(this.tail, 0); this.pos = 0; }
    }
    for (; i + B <= bytes.length; i += B) this.compress(bytes, i);
    if (i < bytes.length) {
      this.tail.set(bytes.subarray(i), 0);
      this.pos = bytes.length - i;
    }
    return this;
  }

  // Length-in-bits is written as two (or four) 32-bit words. `>>> 0` on a
  // double is ToUint32, i.e. exactly "mod 2^32", so the low word is right for
  // any file size a browser can open; `len` itself stays an exact integer well
  // past any of them.
  pad(lenFieldBytes, littleEndian) {
    const B = this.blockSize;
    const bitLen = this.len * 8;
    const rest = B - lenFieldBytes;
    const padLen = ((rest - 1 - (this.len % B)) + B) % B + 1;
    const tail = new Uint8Array(padLen + lenFieldBytes);
    tail[0] = 0x80;
    const lo = bitLen >>> 0;
    const hi = Math.floor(bitLen / 4294967296) >>> 0;
    const at = padLen;
    if (littleEndian) {
      for (let j = 0; j < 4; j++) tail[at + j] = (lo >>> (j * 8)) & 255;
      for (let j = 0; j < 4; j++) tail[at + 4 + j] = (hi >>> (j * 8)) & 255;
    } else {
      const off = at + lenFieldBytes - 8;
      for (let j = 0; j < 4; j++) tail[off + j] = (hi >>> ((3 - j) * 8)) & 255;
      for (let j = 0; j < 4; j++) tail[off + 4 + j] = (lo >>> ((3 - j) * 8)) & 255;
    }
    const saved = this.len;
    this.update(tail);
    this.len = saved;
  }
}

function beBytes(words) {
  const out = new Uint8Array(words.length * 4);
  words.forEach((w, i) => {
    out[i * 4] = (w >>> 24) & 255;
    out[i * 4 + 1] = (w >>> 16) & 255;
    out[i * 4 + 2] = (w >>> 8) & 255;
    out[i * 4 + 3] = w & 255;
  });
  return out;
}

/* ----------------------------------------------------------------- md5 ---- */

// The round schedule is the one already verified against OpenSSL and the RFC
// vectors by the HMAC suite; only the buffering around it is new.
class Md5 extends BlockHash {
  constructor() {
    super(64);
    this.s = Int32Array.of(1732584193, -271733879, -1732584194, 271733878);
    this.x = new Int32Array(16);
  }

  compress(buf, off) {
    const x = this.x;
    for (let j = 0; j < 16; j++) {
      const k = off + j * 4;
      x[j] = buf[k] | (buf[k + 1] << 8) | (buf[k + 2] << 16) | (buf[k + 3] << 24);
    }
    const rl = (n, c) => (n << c) | (n >>> (32 - c));
    const add = (a, b) => (a + b) & 0xffffffff;
    const cmn = (q, a, b, xv, s, t) => add(rl(add(add(a, q), add(xv, t)), s), b);
    const ff = (a, b, c, d, xv, s, t) => cmn((b & c) | (~b & d), a, b, xv, s, t);
    const gg = (a, b, c, d, xv, s, t) => cmn((b & d) | (c & ~d), a, b, xv, s, t);
    const hh = (a, b, c, d, xv, s, t) => cmn(b ^ c ^ d, a, b, xv, s, t);
    const ii = (a, b, c, d, xv, s, t) => cmn(c ^ (b | ~d), a, b, xv, s, t);

    let [a, b, c, d] = this.s;
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a, b, c, d, x[0], 7, -680876936); d = ff(d, a, b, c, x[1], 12, -389564586);
    c = ff(c, d, a, b, x[2], 17, 606105819); b = ff(b, c, d, a, x[3], 22, -1044525330);
    a = ff(a, b, c, d, x[4], 7, -176418897); d = ff(d, a, b, c, x[5], 12, 1200080426);
    c = ff(c, d, a, b, x[6], 17, -1473231341); b = ff(b, c, d, a, x[7], 22, -45705983);
    a = ff(a, b, c, d, x[8], 7, 1770035416); d = ff(d, a, b, c, x[9], 12, -1958414417);
    c = ff(c, d, a, b, x[10], 17, -42063); b = ff(b, c, d, a, x[11], 22, -1990404162);
    a = ff(a, b, c, d, x[12], 7, 1804603682); d = ff(d, a, b, c, x[13], 12, -40341101);
    c = ff(c, d, a, b, x[14], 17, -1502002290); b = ff(b, c, d, a, x[15], 22, 1236535329);
    a = gg(a, b, c, d, x[1], 5, -165796510); d = gg(d, a, b, c, x[6], 9, -1069501632);
    c = gg(c, d, a, b, x[11], 14, 643717713); b = gg(b, c, d, a, x[0], 20, -373897302);
    a = gg(a, b, c, d, x[5], 5, -701558691); d = gg(d, a, b, c, x[10], 9, 38016083);
    c = gg(c, d, a, b, x[15], 14, -660478335); b = gg(b, c, d, a, x[4], 20, -405537848);
    a = gg(a, b, c, d, x[9], 5, 568446438); d = gg(d, a, b, c, x[14], 9, -1019803690);
    c = gg(c, d, a, b, x[3], 14, -187363961); b = gg(b, c, d, a, x[8], 20, 1163531501);
    a = gg(a, b, c, d, x[13], 5, -1444681467); d = gg(d, a, b, c, x[2], 9, -51403784);
    c = gg(c, d, a, b, x[7], 14, 1735328473); b = gg(b, c, d, a, x[12], 20, -1926607734);
    a = hh(a, b, c, d, x[5], 4, -378558); d = hh(d, a, b, c, x[8], 11, -2022574463);
    c = hh(c, d, a, b, x[11], 16, 1839030562); b = hh(b, c, d, a, x[14], 23, -35309556);
    a = hh(a, b, c, d, x[1], 4, -1530992060); d = hh(d, a, b, c, x[4], 11, 1272893353);
    c = hh(c, d, a, b, x[7], 16, -155497632); b = hh(b, c, d, a, x[10], 23, -1094730640);
    a = hh(a, b, c, d, x[13], 4, 681279174); d = hh(d, a, b, c, x[0], 11, -358537222);
    c = hh(c, d, a, b, x[3], 16, -722521979); b = hh(b, c, d, a, x[6], 23, 76029189);
    a = hh(a, b, c, d, x[9], 4, -640364487); d = hh(d, a, b, c, x[12], 11, -421815835);
    c = hh(c, d, a, b, x[15], 16, 530742520); b = hh(b, c, d, a, x[2], 23, -995338651);
    a = ii(a, b, c, d, x[0], 6, -198630844); d = ii(d, a, b, c, x[7], 10, 1126891415);
    c = ii(c, d, a, b, x[14], 15, -1416354905); b = ii(b, c, d, a, x[5], 21, -57434055);
    a = ii(a, b, c, d, x[12], 6, 1700485571); d = ii(d, a, b, c, x[3], 10, -1894986606);
    c = ii(c, d, a, b, x[10], 15, -1051523); b = ii(b, c, d, a, x[1], 21, -2054922799);
    a = ii(a, b, c, d, x[8], 6, 1873313359); d = ii(d, a, b, c, x[15], 10, -30611744);
    c = ii(c, d, a, b, x[6], 15, -1560198380); b = ii(b, c, d, a, x[13], 21, 1309151649);
    a = ii(a, b, c, d, x[4], 6, -145523070); d = ii(d, a, b, c, x[11], 10, -1120210379);
    c = ii(c, d, a, b, x[2], 15, 718787259); b = ii(b, c, d, a, x[9], 21, -343485551);
    this.s[0] = add(a, oa); this.s[1] = add(b, ob);
    this.s[2] = add(c, oc); this.s[3] = add(d, od);
  }

  digest() {
    this.pad(8, true);
    const out = new Uint8Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) out[i * 4 + j] = (this.s[i] >>> (j * 8)) & 255;
    }
    return out;
  }
}

/* --------------------------------------------------------------- sha1 ---- */

class Sha1 extends BlockHash {
  constructor() {
    super(64);
    this.s = Int32Array.of(0x67452301, -271733879, -1732584194, 0x10325476, -1009589776);
    this.w = new Int32Array(80);
  }

  compress(buf, off) {
    const w = this.w;
    for (let j = 0; j < 16; j++) {
      const k = off + j * 4;
      w[j] = (buf[k] << 24) | (buf[k + 1] << 16) | (buf[k + 2] << 8) | buf[k + 3];
    }
    for (let j = 16; j < 80; j++) {
      const v = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
      w[j] = (v << 1) | (v >>> 31);
    }
    let a = this.s[0], b = this.s[1], c = this.s[2], d = this.s[3], e = this.s[4];
    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (j < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = -1894007588; }
      else { f = b ^ c ^ d; k = -899497514; }
      const t = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) | 0;
      e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
    }
    this.s[0] = (this.s[0] + a) | 0; this.s[1] = (this.s[1] + b) | 0;
    this.s[2] = (this.s[2] + c) | 0; this.s[3] = (this.s[3] + d) | 0;
    this.s[4] = (this.s[4] + e) | 0;
  }

  digest() {
    this.pad(8, false);
    return beBytes(this.s);
  }
}

/* ------------------------------------------------------------- sha256 ---- */

class Sha256 extends BlockHash {
  constructor() {
    super(64);
    this.s = sha256H.slice();
    this.w = new Int32Array(64);
  }

  compress(buf, off) {
    const w = this.w;
    for (let j = 0; j < 16; j++) {
      const k = off + j * 4;
      w[j] = (buf[k] << 24) | (buf[k + 1] << 16) | (buf[k + 2] << 8) | buf[k + 3];
    }
    for (let j = 16; j < 64; j++) {
      const x = w[j - 15], y = w[j - 2];
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }
    let a = this.s[0], b = this.s[1], c = this.s[2], d = this.s[3];
    let e = this.s[4], f = this.s[5], g = this.s[6], h = this.s[7];
    for (let j = 0; j < 64; j++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + sha256K[j] + w[j]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    const s = this.s;
    s[0] = (s[0] + a) | 0; s[1] = (s[1] + b) | 0; s[2] = (s[2] + c) | 0; s[3] = (s[3] + d) | 0;
    s[4] = (s[4] + e) | 0; s[5] = (s[5] + f) | 0; s[6] = (s[6] + g) | 0; s[7] = (s[7] + h) | 0;
  }

  digest() {
    this.pad(8, false);
    return beBytes(this.s);
  }
}

/* ------------------------------------------------------------- sha512 ---- */

// 64-bit words as adjacent hi/lo 32-bit halves. Addition carries by comparing
// the unsigned low halves: the sum overflowed exactly when it came out below
// either addend, which is the standard carry test and needs no 64-bit type.
class Sha512 extends BlockHash {
  constructor() {
    super(128);
    this.s = sha512H.slice();
    this.w = new Int32Array(160);
  }

  compress(buf, off) {
    const w = this.w;
    for (let j = 0; j < 32; j++) {
      const k = off + j * 4;
      w[j] = (buf[k] << 24) | (buf[k + 1] << 16) | (buf[k + 2] << 8) | buf[k + 3];
    }
    for (let j = 16; j < 80; j++) {
      const i15h = w[(j - 15) * 2], i15l = w[(j - 15) * 2 + 1];
      // sigma0 = rotr1 ^ rotr8 ^ shr7
      let s0h = ((i15h >>> 1) | (i15l << 31)) ^ ((i15h >>> 8) | (i15l << 24)) ^ (i15h >>> 7);
      let s0l = ((i15l >>> 1) | (i15h << 31)) ^ ((i15l >>> 8) | (i15h << 24)) ^ ((i15l >>> 7) | (i15h << 25));
      const i2h = w[(j - 2) * 2], i2l = w[(j - 2) * 2 + 1];
      // sigma1 = rotr19 ^ rotr61 ^ shr6
      let s1h = ((i2h >>> 19) | (i2l << 13)) ^ ((i2l >>> 29) | (i2h << 3)) ^ (i2h >>> 6);
      let s1l = ((i2l >>> 19) | (i2h << 13)) ^ ((i2h >>> 29) | (i2l << 3)) ^ ((i2l >>> 6) | (i2h << 26));

      const i16h = w[(j - 16) * 2], i16l = w[(j - 16) * 2 + 1];
      const i7h = w[(j - 7) * 2], i7l = w[(j - 7) * 2 + 1];
      let lo = (i16l + s0l) | 0;
      let carry = (lo >>> 0) < (i16l >>> 0) ? 1 : 0;
      let hi = (i16h + s0h + carry) | 0;
      const t1l = (lo + i7l) | 0;
      carry = (t1l >>> 0) < (lo >>> 0) ? 1 : 0;
      const t1h = (hi + i7h + carry) | 0;
      const fl = (t1l + s1l) | 0;
      carry = (fl >>> 0) < (t1l >>> 0) ? 1 : 0;
      const fh = (t1h + s1h + carry) | 0;
      w[j * 2] = fh;
      w[j * 2 + 1] = fl;
    }

    const s = this.s;
    let ah = s[0], al = s[1], bh = s[2], bl = s[3], ch = s[4], cl = s[5], dh = s[6], dl = s[7];
    let eh = s[8], el = s[9], fh2 = s[10], fl2 = s[11], gh = s[12], gl = s[13], hh2 = s[14], hl2 = s[15];

    for (let j = 0; j < 80; j++) {
      // Sigma1(e) = rotr14 ^ rotr18 ^ rotr41
      const S1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((el >>> 9) | (eh << 23));
      const S1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((eh >>> 9) | (el << 23));
      const chh = (eh & fh2) ^ (~eh & gh);
      const chl = (el & fl2) ^ (~el & gl);
      // Sigma0(a) = rotr28 ^ rotr34 ^ rotr39
      const S0h = ((ah >>> 28) | (al << 4)) ^ ((al >>> 2) | (ah << 30)) ^ ((al >>> 7) | (ah << 25));
      const S0l = ((al >>> 28) | (ah << 4)) ^ ((ah >>> 2) | (al << 30)) ^ ((ah >>> 7) | (al << 25));
      const majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
      const majl = (al & bl) ^ (al & cl) ^ (bl & cl);

      let lo = (hl2 + S1l) | 0;
      let carry = (lo >>> 0) < (hl2 >>> 0) ? 1 : 0;
      let hi = (hh2 + S1h + carry) | 0;
      let lo2 = (lo + chl) | 0;
      carry = (lo2 >>> 0) < (lo >>> 0) ? 1 : 0;
      let hi2 = (hi + chh + carry) | 0;
      lo = (lo2 + sha512K[j * 2 + 1]) | 0;
      carry = (lo >>> 0) < (lo2 >>> 0) ? 1 : 0;
      hi = (hi2 + sha512K[j * 2] + carry) | 0;
      const t1l = (lo + w[j * 2 + 1]) | 0;
      carry = (t1l >>> 0) < (lo >>> 0) ? 1 : 0;
      const t1h = (hi + w[j * 2] + carry) | 0;

      const t2l = (S0l + majl) | 0;
      const t2h = (S0h + majh + ((t2l >>> 0) < (S0l >>> 0) ? 1 : 0)) | 0;

      hh2 = gh; hl2 = gl;
      gh = fh2; gl = fl2;
      fh2 = eh; fl2 = el;
      const el2 = (dl + t1l) | 0;
      eh = (dh + t1h + ((el2 >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
      el = el2;
      dh = ch; dl = cl;
      ch = bh; cl = bl;
      bh = ah; bl = al;
      const al2 = (t1l + t2l) | 0;
      ah = (t1h + t2h + ((al2 >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
      al = al2;
    }

    const acc = [ah, al, bh, bl, ch, cl, dh, dl, eh, el, fh2, fl2, gh, gl, hh2, hl2];
    for (let i = 0; i < 8; i++) {
      const lo = (s[i * 2 + 1] + acc[i * 2 + 1]) | 0;
      const carry = (lo >>> 0) < (s[i * 2 + 1] >>> 0) ? 1 : 0;
      s[i * 2] = (s[i * 2] + acc[i * 2] + carry) | 0;
      s[i * 2 + 1] = lo;
    }
  }

  digest() {
    this.pad(16, false);
    return beBytes(this.s);
  }
}

/* -------------------------------------------------------------- crc32 ---- */

class Crc32 {
  constructor() { this.crc = 0xffffffff; }
  update(bytes) { this.crc = crc32Update(this.crc, bytes); return this; }
  digest() {
    const v = (this.crc ^ 0xffffffff) >>> 0;
    return Uint8Array.of((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255);
  }
}

/* ------------------------------------------------------------- catalog ---- */

export const ALGOS = [
  { id: "CRC32", label: "CRC-32", size: 4, secure: false, make: () => new Crc32() },
  { id: "MD5", label: "MD5", size: 16, secure: false, make: () => new Md5() },
  { id: "SHA1", label: "SHA-1", size: 20, secure: false, make: () => new Sha1() },
  { id: "SHA256", label: "SHA-256", size: 32, secure: true, make: () => new Sha256() },
  { id: "SHA512", label: "SHA-512", size: 64, secure: true, make: () => new Sha512() },
];

const BY_ID = /* @__PURE__ */ Object.fromEntries(ALGOS.map((a) => [a.id, a]));

export function algoById(id) {
  return BY_ID[id] || null;
}

// Every digest length here is unique, so the length of a published checksum
// identifies the algorithm on its own. That is what lets the compare box take a
// bare digest with no label and still say which one it is.
export function algoForLength(byteLength) {
  return ALGOS.find((a) => a.size === byteLength) || null;
}

export const DEFAULT_ALGOS = ["MD5", "SHA1", "SHA256"];

/* ---------------------------------------------------------- hashing ------- */

// 4 MB: big enough that per-chunk overhead vanishes, small enough that awaiting
// each slice keeps the tab responsive and progress moves visibly.
export const CHUNK_BYTES = 4 * 1024 * 1024;

export function hashBytes(bytes, ids = DEFAULT_ALGOS) {
  const out = {};
  for (const id of ids) {
    const algo = BY_ID[id];
    if (!algo) continue;
    out[id] = algo.make().update(bytes).digest();
  }
  return out;
}

// One pass over the blob, feeding every selected state from the same chunk.
// `onProgress` is called with bytes-so-far; returning a rejected promise from
// `shouldStop` is not needed — it is polled between chunks instead, so a
// cancelled run stops at a chunk boundary rather than being left half-fed.
export async function hashBlob(blob, ids, { onProgress, shouldStop } = {}) {
  const states = ids.map((id) => ({ id, h: BY_ID[id].make() })).filter((s) => s.h);
  let done = 0;
  if (onProgress) onProgress(0, blob.size);
  while (done < blob.size) {
    if (shouldStop && shouldStop()) return null;
    const end = Math.min(done + CHUNK_BYTES, blob.size);
    const buf = await blob.slice(done, end).arrayBuffer();
    const view = new Uint8Array(buf);
    for (const s of states) s.h.update(view);
    done = end;
    if (onProgress) onProgress(done, blob.size);
  }
  // A zero-length file never enters the loop, and its digests are still real
  // values (the padding block alone), so finalising is unconditional.
  const out = {};
  for (const s of states) out[s.id] = s.h.digest();
  return out;
}

/* ------------------------------------------------- expected checksums ----- */

const BSD_LINE = /^([A-Za-z0-9-]+)\s*\(([^)]*)\)\s*=\s*([0-9a-fA-F]+)$/;
const GNU_LINE = /^([0-9a-fA-F]{8,128})\s+[ *?^]?(.+)$/;
const BARE_HEX = /^[0-9a-fA-F]{8,128}$/;

function baseName(name) {
  return String(name).split(/[\\/]/).pop().trim();
}

// What people paste is rarely a bare digest. It is a line out of SHA256SUMS
// ("<hex>  filename", or "<hex> *filename" in binary mode), a BSD-style
// "SHA256 (file) = <hex>", the whole sums file, or — for S3 and Azure, which
// report Content-MD5 — Base64. Each entry keeps the name it was filed under so
// a multi-file run can match rows to files instead of guessing.
export function parseExpected(raw) {
  const text = String(raw || "").trim();
  if (!text) return { entries: [], errors: [] };

  const entries = [];
  const errors = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith(";")) continue;

    const bsd = t.match(BSD_LINE);
    if (bsd) {
      const hex = hexToBytes(bsd[3]);
      if (hex.ok) {
        entries.push({ bytes: hex.bytes, name: baseName(bsd[2]), tag: bsd[1], form: "hex" });
        continue;
      }
    }

    if (BARE_HEX.test(t)) {
      const hex = hexToBytes(t);
      if (hex.ok) { entries.push({ bytes: hex.bytes, name: "", tag: "", form: "hex" }); continue; }
    }

    const gnu = t.match(GNU_LINE);
    if (gnu) {
      const hex = hexToBytes(gnu[1]);
      if (hex.ok) {
        entries.push({ bytes: hex.bytes, name: baseName(gnu[2]), tag: "", form: "hex" });
        continue;
      }
    }

    // Base64 last: it is the only form that cannot be told apart from ordinary
    // words by shape alone, so it is only tried once nothing else fits, and
    // only when the result is a length some algorithm actually produces.
    if (!/\s/.test(t)) {
      const b64 = base64ToBytes(t);
      if (b64.ok && algoForLength(b64.bytes.length)) {
        entries.push({ bytes: b64.bytes, name: "", tag: "", form: "base64" });
        continue;
      }
    }

    errors.push(t.length > 60 ? t.slice(0, 57) + "…" : t);
  }
  return { entries, errors };
}

// Pick the entry that belongs to a given file. A single pasted checksum is
// unambiguous even when the name beside it differs — people rename downloads —
// so it is used and the difference is reported. A sums file listing a dozen
// releases is the opposite case: picking a row by anything but its name would
// hand back a confident verdict about the wrong file, so with no name match
// there is no verdict at all.
export function entryForFile(entries, fileName) {
  if (!entries.length) return null;
  if (entries.length === 1) return entries[0];
  const want = baseName(fileName).toLowerCase();
  return entries.find((e) => e.name && e.name.toLowerCase() === want) || null;
}

export function nameDiffers(entry, fileName) {
  return Boolean(entry && entry.name && entry.name.toLowerCase() !== baseName(fileName).toLowerCase());
}

// The verdict for one file. The algorithm comes from the digest's length, and
// the comparison is on bytes — so upper- and lower-case hex, Base64 and
// Base64url all land as the same value rather than as three spurious misses.
export function verdictFor(digests, expectedEntry) {
  if (!expectedEntry) return null;
  const algo = algoForLength(expectedEntry.bytes.length);
  if (!algo) {
    return {
      state: "unknown",
      text: `That is ${expectedEntry.bytes.length} bytes, and no checksum here is that length — it is probably truncated, or not a checksum.`,
    };
  }
  const got = digests[algo.id];
  if (!got) return { state: "needs", algo, text: `That is a ${algo.label} digest — tick ${algo.label} above to check it.` };
  return sameBytes(got, expectedEntry.bytes)
    ? { state: "match", algo, text: `${algo.label} matches.` }
    : { state: "mismatch", algo, text: `${algo.label} does not match.` };
}
