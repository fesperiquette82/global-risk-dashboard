export type DataSourceStatus = "live" | "stale" | "mock" | "error";
export type IndicatorCategory = "rates" | "inflation" | "growth" | "credit" | "volatility" | "commodities" | "crypto" | "geopolitics" | "equities";
export type Indicator = { id:string; label:string; category:IndicatorCategory; value:number|null; unit:string; date:string|null; source:string; status:DataSourceStatus; change1d?:number|null; change7d?:number|null; change30d?:number|null; };
export type Bias = "bullish"|"neutral"|"bearish";
export type Confidence = "faible"|"moyenne"|"élevée";
export type MarketCard = {market:string; bias:Bias; up1m:number; down1m:number; up6m:number; confidence:Confidence; drivers:string[]};
export type DashboardModel = {date:string; globalRiskScore:number; riskRegime:string; ratesStressScore:number; inflationStressScore:number; growthStressScore:number; marketStressScore:number; geopoliticalStressScore:number; cryptoRiskScore:number; commodityRiskScore:number; marketCards:MarketCard[]; alerts:string[]; positiveDrivers:string[]; negativeDrivers:string[]; indicators:Indicator[]};
