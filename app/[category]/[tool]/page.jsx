import { notFound } from "next/navigation";
import ToolPage from "@/components/ToolPage";
import { liveTools, getTool, getCategory } from "@/lib/site";
import { toolMetadata } from "@/lib/seo";

import WordCounter from "@/components/tools/WordCounter";
import CaseConverter from "@/components/tools/CaseConverter";
import JsonFormatter from "@/components/tools/JsonFormatter";
import HexToRgb from "@/components/tools/HexToRgb";
import RgbToHex from "@/components/tools/RgbToHex";
import JwtDecoder from "@/components/tools/JwtDecoder";
import SqlFormatter from "@/components/tools/SqlFormatter";
import ColorConverter from "@/components/tools/ColorConverter";
import SipCalculator from "@/components/tools/SipCalculator";
import EmiCalculator from "@/components/tools/EmiCalculator";
import GstCalculator from "@/components/tools/GstCalculator";
import CompoundInterest from "@/components/tools/CompoundInterest";
import FdCalculator from "@/components/tools/FdCalculator";
import PercentageCalculator from "@/components/tools/PercentageCalculator";
import MortgageCalculator from "@/components/tools/MortgageCalculator";
import RdCalculator from "@/components/tools/RdCalculator";
import PpfCalculator from "@/components/tools/PpfCalculator";
import LumpsumCalculator from "@/components/tools/LumpsumCalculator";
import SwpCalculator from "@/components/tools/SwpCalculator";
import CagrCalculator from "@/components/tools/CagrCalculator";
import RoiCalculator from "@/components/tools/RoiCalculator";
import SimpleInterestCalculator from "@/components/tools/SimpleInterestCalculator";
import InflationCalculator from "@/components/tools/InflationCalculator";
import NpsCalculator from "@/components/tools/NpsCalculator";
import GratuityCalculator from "@/components/tools/GratuityCalculator";
import HraCalculator from "@/components/tools/HraCalculator";
import Base64Encoder from "@/components/tools/Base64Encoder";
import UrlEncoder from "@/components/tools/UrlEncoder";
import UuidGenerator from "@/components/tools/UuidGenerator";
import HashGenerator from "@/components/tools/HashGenerator";
import EpochConverter from "@/components/tools/EpochConverter";
import RemoveLineBreaks from "@/components/tools/RemoveLineBreaks";
import RemoveDuplicateLines from "@/components/tools/RemoveDuplicateLines";
import LoremIpsumGenerator from "@/components/tools/LoremIpsumGenerator";
import FindAndReplace from "@/components/tools/FindAndReplace";
import SlugGenerator from "@/components/tools/SlugGenerator";
import ImageResizer from "@/components/tools/ImageResizer";
import ImageConverter from "@/components/tools/ImageConverter";
import ImageCompressor from "@/components/tools/ImageCompressor";
import PassportPhotoMaker from "@/components/tools/PassportPhotoMaker";
import TextReverser from "@/components/tools/TextReverser";
import NumberToWords from "@/components/tools/NumberToWords";
import CsvToJson from "@/components/tools/CsvToJson";
import JsonToCsv from "@/components/tools/JsonToCsv";
import HtmlMinifier from "@/components/tools/HtmlMinifier";
import YamlToJson from "@/components/tools/YamlToJson";
import MergePdf from "@/components/tools/MergePdf";
import SplitPdf from "@/components/tools/SplitPdf";
import CompressPdf from "@/components/tools/CompressPdf";
import PdfToJpg from "@/components/tools/PdfToJpg";
import JpgToPdf from "@/components/tools/JpgToPdf";
import RotatePdf from "@/components/tools/RotatePdf";
import UnlockPdf from "@/components/tools/UnlockPdf";
import WatermarkPdf from "@/components/tools/WatermarkPdf";

const REGISTRY = {
  "word-counter": WordCounter,
  "case-converter": CaseConverter,
  "json-formatter": JsonFormatter,
  "hex-to-rgb": HexToRgb,
  "rgb-to-hex": RgbToHex,
  "jwt-decoder": JwtDecoder,
  "sql-formatter": SqlFormatter,
  "color-converter": ColorConverter,
  "sip-calculator": SipCalculator,
  "emi-calculator": EmiCalculator,
  "gst-calculator": GstCalculator,
  "compound-interest-calculator": CompoundInterest,
  "fd-calculator": FdCalculator,
  "percentage-calculator": PercentageCalculator,
  "mortgage-calculator": MortgageCalculator,
  "rd-calculator": RdCalculator,
  "ppf-calculator": PpfCalculator,
  "lumpsum-calculator": LumpsumCalculator,
  "swp-calculator": SwpCalculator,
  "cagr-calculator": CagrCalculator,
  "roi-calculator": RoiCalculator,
  "simple-interest-calculator": SimpleInterestCalculator,
  "inflation-calculator": InflationCalculator,
  "nps-calculator": NpsCalculator,
  "gratuity-calculator": GratuityCalculator,
  "hra-calculator": HraCalculator,
  "base64-encoder": Base64Encoder,
  "url-encoder": UrlEncoder,
  "uuid-generator": UuidGenerator,
  "hash-generator": HashGenerator,
  "epoch-converter": EpochConverter,
  "remove-line-breaks": RemoveLineBreaks,
  "remove-duplicate-lines": RemoveDuplicateLines,
  "lorem-ipsum-generator": LoremIpsumGenerator,
  "find-and-replace": FindAndReplace,
  "slug-generator": SlugGenerator,
  "image-resizer": ImageResizer,
  "image-converter": ImageConverter,
  "image-compressor": ImageCompressor,
  "passport-photo-maker": PassportPhotoMaker,
  "text-reverser": TextReverser,
  "number-to-words": NumberToWords,
  "csv-to-json": CsvToJson,
  "json-to-csv": JsonToCsv,
  "html-minifier": HtmlMinifier,
  "yaml-to-json": YamlToJson,
  "merge-pdf": MergePdf,
  "split-pdf": SplitPdf,
  "compress-pdf": CompressPdf,
  "pdf-to-jpg": PdfToJpg,
  "jpg-to-pdf": JpgToPdf,
  "rotate-pdf": RotatePdf,
  "unlock-pdf": UnlockPdf,
  "watermark-pdf": WatermarkPdf,
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
