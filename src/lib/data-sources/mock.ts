import { Indicator } from '@/lib/types';

const now = () => new Date().toISOString();

export const macroMockIndicators = (): Indicator[] => [
  { id: 'us10y', label: 'US 10Y Yield', category: 'rates', value: 4.3, unit: '%', date: now(), source: 'mock', status: 'mock', change7d: 0.1 },
  { id: 'us2y', label: 'US 2Y Yield', category: 'rates', value: 4.65, unit: '%', date: now(), source: 'mock', status: 'mock', change7d: 0.05 },
  { id: 'yield_spread_10y_2y', label: '10Y-2Y Spread', category: 'growth', value: -0.35, unit: 'pp', date: now(), source: 'mock', status: 'mock' },
  { id: 'unemployment', label: 'US Unemployment', category: 'growth', value: 4.1, unit: '%', date: now(), source: 'mock', status: 'mock', change30d: 0.1 },
  { id: 'cpi', label: 'US CPI', category: 'inflation', value: 314.2, unit: 'index', date: now(), source: 'mock', status: 'mock' },
  { id: 'vix_proxy', label: 'VIX Proxy', category: 'volatility', value: 19, unit: 'index', date: now(), source: 'mock', status: 'mock', change7d: 2 },
];

export const cryptoMockIndicators = (): Indicator[] => [
  { id: 'btc', label: 'Bitcoin', category: 'crypto', value: 62000, unit: 'USD', date: now(), source: 'mock', status: 'mock', change7d: -3 },
  { id: 'eth', label: 'Ethereum', category: 'crypto', value: 3100, unit: 'USD', date: now(), source: 'mock', status: 'mock', change7d: -2.2 },
];

export const commodityMockIndicators = (): Indicator[] => [
  { id: 'wti', label: 'WTI Oil', category: 'commodities', value: 84, unit: 'USD', date: now(), source: 'mock', status: 'mock', change7d: 4 },
  { id: 'gold', label: 'Gold', category: 'commodities', value: 2320, unit: 'USD', date: now(), source: 'mock', status: 'mock', change7d: 1.5 },
];

export const geopoliticsMockIndicators = (): Indicator[] => [
  { id: 'gdelt_volume', label: 'GDELT Keyword Volume', category: 'geopolitics', value: 68, unit: 'articles', date: now(), source: 'mock', status: 'mock' },
];

export const mockIndicators = (): Indicator[] => [
  ...macroMockIndicators(),
  ...cryptoMockIndicators(),
  ...commodityMockIndicators(),
  ...geopoliticsMockIndicators(),
];
