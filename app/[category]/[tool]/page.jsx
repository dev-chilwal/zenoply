import { notFound } from "next/navigation";
import ToolPage from "@/components/ToolPage";
import { liveTools, getTool, getCategory } from "@/lib/site";
import { toolMetadata } from "@/lib/seo";

import WordCounter from "@/components/tools/WordCounter";
import CaseConverter from "@/components/tools/CaseConverter";
import JsonFormatter from "@/components/tools/JsonFormatter";
import HexToRgb from "@/components/tools/HexToRgb";
import SipCalculator from "@/components/tools/SipCalculator";
import EmiCalculator from "@/components/tools/EmiCalculator";
import GstCalculator from "@/components/tools/GstCalculator";
import CompoundInterest from "@/components/tools/CompoundInterest";
import FdCalculator from "@/components/tools/FdCalculator";

const REGISTRY = {
  "word-counter": WordCounter,
  "case-converter": CaseConverter,
  "json-formatter": JsonFormatter,
  "hex-to-rgb": HexToRgb,
  "sip-calculator": SipCalculator,
  "emi-calculator": EmiCalculator,
  "gst-calculator": GstCalculator,
  "compound-interest-calculator": CompoundInterest,
  "fd-calculator": FdCalculator,
};

export function generateStaticParams() {
  return liveTools().map((t) => ({ category: t.category, tool: t.slug }));
}

export function generateMetadata({ params }) {
  const tool = getTool(params.category, params.tool);
  const category = getCategory(params.category);
  if (!tool || !category) return {};
  return toolMetadata(tool, category);
}

export default function Page({ params }) {
  const tool = getTool(params.category, params.tool);
  const Component = REGISTRY[params.tool];
  if (!tool || !Component) notFound();
  return (
    <ToolPage tool={tool}>
      <Component />
    </ToolPage>
  );
}
