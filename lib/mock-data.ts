// Mock data for LFA Investment OS - Atwater Family Office
// All figures are illustrative and for demonstration purposes only.

export const CLIENT = {
  name: "Atwater Family Office",
  advisor: "Sarah Chen, CFA",
  advisorTitle: "Senior Wealth Advisor",
  aum: 47_300_000,
  aumFormatted: "$47.3M",
  inceptionDate: "2018-01-01",
  entities: [
    "Atwater Holdings LLC",
    "Atwater Family Trust",
    "Atwater Investment Partnership LP",
  ],
};

export const HOLDINGS = [
  {
    id: "cash",
    name: "Cash Reserve",
    category: "Liquid",
    allocationPct: 8,
    value: 3_780_000,
    color: "#94a3b8",
  },
  {
    id: "muni",
    name: "Municipal Bond Portfolio",
    category: "Fixed Income",
    allocationPct: 15,
    value: 7_100_000,
    color: "#60a5fa",
  },
  {
    id: "equity",
    name: "Public Equity Portfolio",
    category: "Public Equity",
    allocationPct: 28,
    value: 13_240_000,
    color: "#34d399",
  },
  {
    id: "credit",
    name: "Private Credit Fund I",
    category: "Private Credit",
    allocationPct: 12,
    value: 5_680_000,
    color: "#f59e0b",
  },
  {
    id: "industrial",
    name: "Industrial Services Direct Investment",
    category: "Direct Investment",
    allocationPct: 10,
    value: 4_730_000,
    color: "#8b5cf6",
  },
  {
    id: "realestate",
    name: "Real Estate Partnership",
    category: "Real Assets",
    allocationPct: 14,
    value: 6_620_000,
    color: "#f97316",
  },
  {
    id: "venture",
    name: "Venture Fund II",
    category: "Venture / PE",
    allocationPct: 7,
    value: 3_310_000,
    color: "#ec4899",
  },
  {
    id: "roofing",
    name: "Roofing Platform Investment",
    category: "Direct Investment",
    allocationPct: 6,
    value: 2_840_000,
    color: "#14b8a6",
  },
];

export const PERFORMANCE = {
  ytd: 6.4,
  oneYear: 11.2,
  inception: 54.7,
  benchmarkYtd: 5.1,
  benchmarkOneYear: 9.8,
};

export const PERFORMANCE_HISTORY = [
  { month: "Jan", portfolio: 1.2, benchmark: 0.9 },
  { month: "Feb", portfolio: -0.4, benchmark: -0.6 },
  { month: "Mar", portfolio: 2.1, benchmark: 1.8 },
  { month: "Apr", portfolio: 0.8, benchmark: 0.5 },
  { month: "May", portfolio: 1.5, benchmark: 1.2 },
  { month: "Jun", portfolio: 1.1, benchmark: 1.3 },
];

export const MEETINGS = [
  {
    id: "m1",
    title: "Q2 Portfolio Review",
    date: "2026-06-20",
    time: "10:00 AM",
    attendees: ["Sarah Chen, CFA", "Jonathan Atwater", "Eleanor Atwater"],
    status: "Scheduled",
    notes: "Review Q2 performance, discuss allocation adjustments.",
  },
  {
    id: "m2",
    title: "Annual IPS Review",
    date: "2026-07-15",
    time: "2:00 PM",
    attendees: ["Sarah Chen, CFA", "Jonathan Atwater"],
    status: "Scheduled",
    notes: "Annual review of Investment Policy Statement objectives.",
  },
  {
    id: "m3",
    title: "Private Credit Opportunity Discussion",
    date: "2026-06-05",
    time: "11:00 AM",
    attendees: ["Sarah Chen, CFA", "Jonathan Atwater"],
    status: "Completed",
    notes: "Discussed potential follow-on to Private Credit Fund I.",
  },
];

export const DOCUMENTS = [
  {
    id: "d1",
    name: "Investment Policy Statement 2026",
    type: "IPS",
    date: "2026-01-15",
    status: "Approved",
  },
  {
    id: "d2",
    name: "Q1 2026 Portfolio Report",
    type: "Report",
    date: "2026-04-10",
    status: "Final",
  },
  {
    id: "d3",
    name: "Industrial Services Diligence Memo",
    type: "Diligence",
    date: "2025-11-20",
    status: "Approved",
  },
  {
    id: "d4",
    name: "Roofing Platform Investment Memo",
    type: "Diligence",
    date: "2025-09-05",
    status: "Approved",
  },
  {
    id: "d5",
    name: "2026 Tax Planning Summary",
    type: "Planning",
    date: "2026-03-01",
    status: "Draft for Advisor Review",
  },
];

export const ACTIVITY_FEED = [
  {
    id: "a1",
    action: "Document uploaded",
    detail: "Q1 2026 Portfolio Report",
    date: "2026-04-10",
    user: "Sarah Chen",
  },
  {
    id: "a2",
    action: "Meeting scheduled",
    detail: "Q2 Portfolio Review on June 20",
    date: "2026-04-08",
    user: "Sarah Chen",
  },
  {
    id: "a3",
    action: "IPS updated",
    detail: "Investment Policy Statement 2026 approved",
    date: "2026-01-15",
    user: "Sarah Chen",
  },
  {
    id: "a4",
    action: "Holding added",
    detail: "Roofing Platform Investment onboarded",
    date: "2025-09-10",
    user: "Sarah Chen",
  },
];

export const IPS_SUMMARY = {
  objective: "Long-term capital appreciation with income generation and capital preservation for multi-generational wealth.",
  timeHorizon: "20+ years (multi-generational)",
  riskTolerance: "Moderate-Aggressive",
  liquidityNeeds: "Minimum 8% liquid assets at all times",
  restrictions: [
    "No tobacco or weapons manufacturing",
    "ESG screening on public equity",
  ],
  targetAllocation: {
    liquid: 8,
    fixedIncome: 15,
    publicEquity: 28,
    privateCredit: 12,
    directInvestment: 16,
    realAssets: 14,
    ventureAndPE: 7,
  },
};
