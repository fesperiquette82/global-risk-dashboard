import { DashboardModel, Indicator, MarketCard } from '@/lib/types';

const get = (i: Indicator[], id: string) => i.find((x) => x.id === id)?.value ?? null;
export const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
export const roundToStepAndClamp = (n: number, step = 5) => clamp100(Math.round(n / step) * step);

function marketCard(market: string, stress: number, liveCount: number): MarketCard {
  const safe = clamp100(stress);
  return {
    market,
    bias: safe > 60 ? 'bearish' : safe < 40 ? 'bullish' : 'neutral',
    up1m: roundToStepAndClamp(100 - safe),
    down1m: roundToStepAndClamp(safe),
    up6m: roundToStepAndClamp(90 - safe / 2),
    confidence: liveCount > 5 ? 'élevée' : liveCount > 2 ? 'moyenne' : 'faible',
    drivers: [`Stress score ${safe}`],
  };
}

export function computeDashboardModel(indicators: Indicator[]): DashboardModel {
  const vix = get(indicators, 'vix_proxy') ?? 20;
  const oil = get(indicators, 'wti') ?? 75;
  const spread = get(indicators, 'yield_spread_10y_2y') ?? 0;
  const unemp = get(indicators, 'unemployment') ?? 4;
  const btc7 = indicators.find((i) => i.id === 'btc')?.change7d ?? 0;
  const geo = get(indicators, 'gdelt_volume') ?? 20;

  const rates = clamp100((vix - 15) * 2 + Math.max(0, oil - 80));
  const infl = clamp100(Math.max(0, oil - 75) * 1.5);
  const growth = clamp100((spread < 0 ? 25 : 5) + (unemp > 4 ? 15 : 5));
  const geoS = clamp100(geo);
  const crypto = clamp100(Math.max(0, -btc7 * 4));
  const commod = clamp100(Math.max(0, oil - 70));
  const market = clamp100((rates + growth + crypto) / 3);
  const global = clamp100((rates + infl + growth + geoS + crypto + commod + market) / 7);

  const regime = global < 30 ? 'Risk-on' : global < 45 ? 'Normal' : global < 60 ? 'Fragile' : global < 75 ? 'Stress élevé' : 'Crise';
  const liveCount = indicators.filter((i) => i.status === 'live').length;

  return {
    date: new Date().toISOString(),
    globalRiskScore: global,
    riskRegime: regime,
    ratesStressScore: rates,
    inflationStressScore: infl,
    growthStressScore: growth,
    marketStressScore: market,
    geopoliticalStressScore: geoS,
    cryptoRiskScore: crypto,
    commodityRiskScore: commod,
    marketCards: [
      marketCard('Actions US', market, liveCount),
      marketCard('Actions Europe', market + 5, liveCount),
      marketCard('Obligations', rates, liveCount),
      marketCard('Or', commod, liveCount),
      marketCard('Pétrole', commod + 8, liveCount),
      marketCard('Crypto', crypto, liveCount),
      marketCard('Matières premières', commod, liveCount),
    ],
    alerts: global > 65 ? ['Risque macro élevé'] : [],
    positiveDrivers: spread > 0 ? ['Courbe normale'] : ['Inflation stable'],
    negativeDrivers: [oil > 85 ? 'Pétrole en hausse' : '', spread < 0 ? 'Courbe inversée' : ''].filter(Boolean),
    indicators,
  };
}
