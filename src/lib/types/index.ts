export type DataSourceStatus = "live" | "stale" | "mock" | "error";
export type IndicatorCategory = "rates" | "inflation" | "growth" | "credit" | "volatility" | "commodities" | "crypto" | "geopolitics" | "equities";
export type Indicator = { id:string; label:string; category:IndicatorCategory; value:number|null; unit:string; date:string|null; source:string; status:DataSourceStatus; change1d?:number|null; change7d?:number|null; change30d?:number|null; };
export type Bias = "bullish"|"neutral"|"bearish";
export type Confidence = "faible"|"moyenne"|"élevée";
export type MarketCard = {market:string; bias:Bias; stressScore:number; confidence:Confidence; drivers:string[]};
export type DashboardModel = {date:string; globalRiskScore:number; riskRegime:string; ratesStressScore:number; inflationStressScore:number; growthStressScore:number; marketStressScore:number; geopoliticalStressScore:number; cryptoRiskScore:number; commodityRiskScore:number; creditStressScore:number; marketCards:MarketCard[]; alerts:string[]; positiveDrivers:string[]; negativeDrivers:string[]; indicators:Indicator[]};

export type TrendLabel = "haussière" | "neutre" | "baissière";
export type AssetSignal = {
  ticker: string;
  name: string;
  price: number | null;
  changePct1d: number | null;
  return3m: number | null;
  priceVsSma50Pct: number | null;
  trend: TrendLabel;
  realizedVolAnnualizedPct: number | null;
  peRatio: number | null;
  dividendYieldPct: number | null;
  week52High: number | null;
  week52Low: number | null;
  status: DataSourceStatus;
  asOf: string | null;
};
