// Which regions have a researched, verified national tax model behind them.
//
// Salary and income-tax tools encode statute (brackets, levies, offsets,
// mandatory contributions), not just a currency symbol. Adding a region here
// means committing to maintain its figures each financial year — so a region
// is listed only once its rules are implemented and verified against the
// national revenue authority's own worked examples.

// Coverage differs by tool, because a country can be verified for one and not
// the other. Germany's income tax (§32a) is verified exactly against the
// official Grundtabelle, but its gross→net take-home depends on the
// Vorsorgepauschale, for which no authority worked example exists — so the
// German TAKE-HOME is held back until it can be checked against the BMF
// calculator, while the German income tax calculator ships.

/** Regions with a verified take-home (in-hand salary) model. */
export const SALARY_MODEL_REGIONS = ["IN", "AU", "IE", "GB", "NL", "FR", "AE", "US", "CA", "SG"];

/** Regions with a verified income-tax model. */
export const INCOME_TAX_MODEL_REGIONS = ["IN", "AU", "IE", "GB", "NL", "DE", "FR", "AE", "US", "CA", "SG"];

/** Union — any region with a tax model behind either tool. */
export const TAX_MODEL_REGIONS = [...new Set([...SALARY_MODEL_REGIONS, ...INCOME_TAX_MODEL_REGIONS])];

export const hasTaxModel = (code) => TAX_MODEL_REGIONS.includes(code);

/** Regions whose tools encode rules with no equivalent elsewhere. */
export const INDIA_ONLY = "IN";
