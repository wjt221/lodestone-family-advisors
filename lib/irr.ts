// XIRR — irregular-interval internal rate of return.
// Newton-Raphson solver. Cash flows must include at least one negative
// (investment) and one positive (distribution / terminal value).

export interface XCashFlow {
  date: Date;
  amount: number; // negative = capital out, positive = distribution / current value
}

function npv(rate: number, flows: XCashFlow[], t0: number): number {
  return flows.reduce((sum, cf) => {
    const t = (cf.date.getTime() - t0) / (365.25 * 24 * 3600 * 1000);
    return sum + cf.amount / Math.pow(1 + rate, t);
  }, 0);
}

function dnpv(rate: number, flows: XCashFlow[], t0: number): number {
  return flows.reduce((sum, cf) => {
    const t = (cf.date.getTime() - t0) / (365.25 * 24 * 3600 * 1000);
    return sum - (t * cf.amount) / Math.pow(1 + rate, t + 1);
  }, 0);
}

export function xirr(flows: XCashFlow[], guess = 0.1): number | null {
  if (flows.length < 2) return null;
  const hasNeg = flows.some((f) => f.amount < 0);
  const hasPos = flows.some((f) => f.amount > 0);
  if (!hasNeg || !hasPos) return null;

  const t0 = Math.min(...flows.map((f) => f.date.getTime()));
  let r = guess;

  for (let i = 0; i < 200; i++) {
    const f = npv(r, flows, t0);
    const df = dnpv(r, flows, t0);
    if (Math.abs(df) < 1e-12) break;
    const rNew = r - f / df;
    if (!isFinite(rNew)) break;
    if (Math.abs(rNew - r) < 1e-8) return rNew;
    r = Math.max(rNew, -0.9999);
  }
  return null;
}

// Multiple on Invested Capital
export function moic(totalInvested: number, currentValue: number, distributions: number): number {
  if (totalInvested <= 0) return 0;
  return (currentValue + distributions) / totalInvested;
}

export function fmtIrr(rate: number | null): string {
  if (rate === null) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

export function fmtMoic(m: number): string {
  if (m === 0) return "—";
  return `${m.toFixed(2)}x`;
}
