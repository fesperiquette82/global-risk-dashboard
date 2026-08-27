import { Indicator } from '@/lib/types';
import { fetchJson } from './utils';

type FredMap = {
  seriesId: 'DGS10' | 'DGS2' | 'UNRATE' | 'CPIAUCSL' | 'VIXCLS' | 'BAMLH0A0HYM2' | 'T10Y2Y';
  id: 'us10y' | 'us2y' | 'unemployment' | 'cpi_yoy' | 'vix' | 'credit_spread_hy' | 'yield_spread_10y_2y';
  label: string;
  category: Indicator['category'];
  unit: string;
  params?: string;
};

const SERIES: FredMap[] = [
  { seriesId: 'DGS10', id: 'us10y', label: 'US 10Y Yield', category: 'rates', unit: '%' },
  { seriesId: 'DGS2', id: 'us2y', label: 'US 2Y Yield', category: 'rates', unit: '%' },
  { seriesId: 'T10Y2Y', id: 'yield_spread_10y_2y', label: '10Y-2Y Spread', category: 'growth', unit: 'pp' },
  { seriesId: 'UNRATE', id: 'unemployment', label: 'US Unemployment', category: 'growth', unit: '%' },
  { seriesId: 'CPIAUCSL', id: 'cpi_yoy', label: 'US CPI (YoY)', category: 'inflation', unit: '%', params: 'units=pc1' },
  { seriesId: 'VIXCLS', id: 'vix', label: 'VIX (CBOE)', category: 'volatility', unit: 'index' },
  { seriesId: 'BAMLH0A0HYM2', id: 'credit_spread_hy', label: 'US High Yield OAS', category: 'credit', unit: 'pp' },
];

export async function fetchFred(): Promise<Indicator[]> {
  const key = process.env.FRED_API_KEY;
  if (!key) return [];

  try {
    const out: Indicator[] = [];
    for (const s of SERIES) {
      const extra = s.params ? `&${s.params}` : '';
      const j = await fetchJson(`https://api.stlouisfed.org/fred/series/observations?series_id=${s.seriesId}&api_key=${key}&file_type=json&sort_order=desc&limit=2${extra}`);
      const o = j?.observations?.[0];
      const value = Number(o?.value);
      out.push({
        id: s.id,
        label: s.label,
        category: s.category,
        value: Number.isFinite(value) ? value : null,
        unit: s.unit,
        date: o?.date ?? null,
        source: 'FRED',
        status: Number.isFinite(value) ? 'live' : 'error',
      });
    }
    return out;
  } catch {
    return [];
  }
}
