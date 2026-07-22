"use client";
// Take-home pay depends entirely on national tax law, so this tool dispatches
// to a per-country model rather than reformatting one country's maths into
// another country's currency.

import { CalcGrid, CalcMain } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { RegionUnsupported } from "@/components/calc/RegionNotice";
import { SALARY_MODEL_REGIONS } from "@/lib/tax/coverage";
import InHandSalaryIN from "./salary/InHandSalaryIN";
import InHandSalaryAU from "./salary/InHandSalaryAU";
import InHandSalaryIE from "./salary/InHandSalaryIE";
import InHandSalaryGB from "./salary/InHandSalaryGB";
import InHandSalaryNL from "./salary/InHandSalaryNL";
import InHandSalaryFR from "./salary/InHandSalaryFR";
import InHandSalaryAE from "./salary/InHandSalaryAE";
import InHandSalaryUS from "./salary/InHandSalaryUS";
import InHandSalaryCA from "./salary/InHandSalaryCA";
import InHandSalarySG from "./salary/InHandSalarySG";
// Germany's take-home (InHandSalaryDE) is held back until its Vorsorgepauschale
// composite can be verified against the BMF calculator; German income tax ships.

const MODELS = {
  IN: InHandSalaryIN, AU: InHandSalaryAU, IE: InHandSalaryIE,
  GB: InHandSalaryGB, NL: InHandSalaryNL, FR: InHandSalaryFR, AE: InHandSalaryAE,
  US: InHandSalaryUS, CA: InHandSalaryCA, SG: InHandSalarySG,
};

export default function InHandSalaryCalculator() {
  const { code } = useRegion();
  const Model = MODELS[code];

  if (!Model) {
    return (
      <CalcGrid>
        <CalcMain>
          <RegionUnsupported tool="in-hand salary calculator" supported={SALARY_MODEL_REGIONS} />
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
