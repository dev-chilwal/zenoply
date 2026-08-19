// The one thing that sets these tools apart from the upload-and-wait competition:
// everything runs locally and there is no account. Shown on every tool page so the
// claim lands on-page, where it is not subject to meta-description truncation.
export default function TrustStrip() {
  return (
    <div className="trust-strip">
      <span className="pill pill-live">
        <span className="dot" />
        Runs in your browser
      </span>
      <span className="pill">Nothing uploaded</span>
      <span className="pill">Free &middot; no signup</span>
    </div>
  );
}
