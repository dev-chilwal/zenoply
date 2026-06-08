import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
      <h1>Tool not found</h1>
      <p className="lead">This tool isn’t available yet — but 1,000 more are on the way.</p>
      <Link href="/" className="btn">Back to home</Link>
    </div>
  );
}
