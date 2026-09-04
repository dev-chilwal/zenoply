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
import StepUpSipCalculator from "@/components/tools/StepUpSipCalculator";
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
import IncomeTaxCalculator from "@/components/tools/IncomeTaxCalculator";
import InHandSalaryCalculator from "@/components/tools/InHandSalaryCalculator";
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
import CompressImageToSize from "@/components/tools/CompressImageToSize";
import PassportPhotoMaker from "@/components/tools/PassportPhotoMaker";
import ExamPhotoResizer from "@/components/tools/ExamPhotoResizer";
import TextReverser from "@/components/tools/TextReverser";
import NumberToWords from "@/components/tools/NumberToWords";
import CsvToJson from "@/components/tools/CsvToJson";
import JsonToCsv from "@/components/tools/JsonToCsv";
import HtmlMinifier from "@/components/tools/HtmlMinifier";
import YamlToJson from "@/components/tools/YamlToJson";
import JsonToYaml from "@/components/tools/JsonToYaml";
import MergePdf from "@/components/tools/MergePdf";
import SplitPdf from "@/components/tools/SplitPdf";
import CompressPdf from "@/components/tools/CompressPdf";
import CompressPdfToSize from "@/components/tools/CompressPdfToSize";
import PdfToJpg from "@/components/tools/PdfToJpg";
import JpgToPdf from "@/components/tools/JpgToPdf";
import RotatePdf from "@/components/tools/RotatePdf";
import UnlockPdf from "@/components/tools/UnlockPdf";
import ProtectPdf from "@/components/tools/ProtectPdf";
import WatermarkPdf from "@/components/tools/WatermarkPdf";
import PdfToWord from "@/components/tools/PdfToWord";
import PdfToExcel from "@/components/tools/PdfToExcel";
import AddPageNumbers from "@/components/tools/AddPageNumbers";
import OrganizePdf from "@/components/tools/OrganizePdf";
import RemovePages from "@/components/tools/RemovePages";
import RemoveBlankPages from "@/components/tools/RemoveBlankPages";
import ImageToText from "@/components/tools/ImageToText";
import OcrPdf from "@/components/tools/OcrPdf";
import CropImage from "@/components/tools/CropImage";
import ExifViewer from "@/components/tools/ExifViewer";
import QrCodeGenerator from "@/components/tools/QrCodeGenerator";
import CgpaToPercentage from "@/components/tools/CgpaToPercentage";
import RupeesInWords from "@/components/tools/RupeesInWords";
import TokenCounter from "@/components/tools/TokenCounter";
import HeicToJpg from "@/components/tools/HeicToJpg";
import PdfMetadata from "@/components/tools/PdfMetadata";
import PdfToText from "@/components/tools/PdfToText";
import ResizePdfPages from "@/components/tools/ResizePdfPages";
import CropPdf from "@/components/tools/CropPdf";
import ExtractPdfImages from "@/components/tools/ExtractPdfImages";
import FillPdfForm from "@/components/tools/FillPdfForm";
import XmlFormatter from "@/components/tools/XmlFormatter";
import StringEscaper from "@/components/tools/StringEscaper";
import CronExpressionGenerator from "@/components/tools/CronExpressionGenerator";
import HtmlBeautifier from "@/components/tools/HtmlBeautifier";

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
  "step-up-sip-calculator": StepUpSipCalculator,
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
  "income-tax-calculator": IncomeTaxCalculator,
  "in-hand-salary-calculator": InHandSalaryCalculator,
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
  "compress-image-to-size": CompressImageToSize,
  "passport-photo-maker": PassportPhotoMaker,
  "exam-photo-resizer": ExamPhotoResizer,
  "text-reverser": TextReverser,
  "number-to-words": NumberToWords,
  "rupees-in-words": RupeesInWords,
  "csv-to-json": CsvToJson,
  "json-to-csv": JsonToCsv,
  "html-minifier": HtmlMinifier,
  "yaml-to-json": YamlToJson,
  "json-to-yaml": JsonToYaml,
  "merge-pdf": MergePdf,
  "split-pdf": SplitPdf,
  "compress-pdf": CompressPdf,
  "compress-pdf-to-size": CompressPdfToSize,
  "pdf-to-jpg": PdfToJpg,
  "jpg-to-pdf": JpgToPdf,
  "rotate-pdf": RotatePdf,
  "unlock-pdf": UnlockPdf,
  "protect-pdf": ProtectPdf,
  "watermark-pdf": WatermarkPdf,
  "pdf-to-word": PdfToWord,
  "pdf-to-excel": PdfToExcel,
  "add-page-numbers": AddPageNumbers,
  "organize-pdf": OrganizePdf,
  "remove-pages": RemovePages,
  "remove-blank-pages": RemoveBlankPages,
  "image-to-text": ImageToText,
  "ocr-pdf": OcrPdf,
  "crop-image": CropImage,
  "exif-viewer": ExifViewer,
  "heic-to-jpg": HeicToJpg,
  "qr-code-generator": QrCodeGenerator,
  "cgpa-to-percentage": CgpaToPercentage,
  "token-counter": TokenCounter,
  "pdf-metadata": PdfMetadata,
  "pdf-to-text": PdfToText,
  "resize-pdf-pages": ResizePdfPages,
  "crop-pdf": CropPdf,
  "extract-images-from-pdf": ExtractPdfImages,
  "fill-pdf-form": FillPdfForm,
  "xml-formatter": XmlFormatter,
  "string-escaper": StringEscaper,
  "cron-expression-generator": CronExpressionGenerator,
  "html-beautifier": HtmlBeautifier,
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
