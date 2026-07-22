"use client";
// Income tax is statutory per country, so this dispatches to a per-country
// model rather than reformatting one country's slabs into another's currency.

import { CalcGrid, CalcMain } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { RegionUnsupported } from "@/components/calc/RegionNotice";
import { INCOME_TAX_MODEL_REGIONS } from "@/lib/tax/coverage";
import IncomeTaxIN from "./incometax/IncomeTaxIN";
import IncomeTaxAU from "./incometax/IncomeTaxAU";
import IncomeTaxIE from "./incometax/IncomeTaxIE";
import IncomeTaxGB from "./incometax/IncomeTaxGB";
import IncomeTaxNL from "./incometax/IncomeTaxNL";
import IncomeTaxDE from "./incometax/IncomeTaxDE";
import IncomeTaxFR from "./incometax/IncomeTaxFR";
import IncomeTaxAE from "./incometax/IncomeTaxAE";
import IncomeTaxUS from "./incometax/IncomeTaxUS";
import IncomeTaxCA from "./incometax/IncomeTaxCA";
import IncomeTaxSG from "./incometax/IncomeTaxSG";

const MODELS = {
  IN: IncomeTaxIN, AU: IncomeTaxAU, IE: IncomeTaxIE,
  GB: IncomeTaxGB, NL: IncomeTaxNL, DE: IncomeTaxDE, FR: IncomeTaxFR, AE: IncomeTaxAE,
  US: IncomeTaxUS, CA: IncomeTaxCA, SG: IncomeTaxSG,
};

export default function IncomeTaxCalculator() {
  const { code } = useRegion();
  const Model = MODELS[code];

  if (!Model) {
    return (
      <CalcGrid>
        <CalcMain>
          <RegionUnsupported tool="income tax calculator" supported={INCOME_TAX_MODEL_REGIONS} />
        </CalcMain>
      </CalcGrid>
    );
  }

  return (
    <CalcGrid>
      <Model />
    </CalcGrid>
  );
}
