import { notFound } from "next/navigation";
import GuidePage from "@/components/GuidePage";
import { allGuides, getGuide } from "@/lib/guides";
import { guideMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return allGuides().map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }) {
  const guide = getGuide(params.slug);
  if (!guide) return {};
  return guideMetadata(guide);
}

export default function Page({ params }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();
  return <GuidePage guide={guide} />;
}
