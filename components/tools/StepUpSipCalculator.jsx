"use client";
import SipCalculator from "./SipCalculator";

// Dedicated /finance/step-up-sip-calculator page — the same SIP calculator with
// the annual step-up pre-filled, so it owns the "step up sip calculator" query.
export default function StepUpSipCalculator() {
  return <SipCalculator defaultStepUp={10} />;
}
