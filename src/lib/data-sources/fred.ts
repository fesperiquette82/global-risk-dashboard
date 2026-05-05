import { Indicator } from '@/lib/types';
import { fetchJson } from './utils';

type FredMap = {
  seriesId: 'DGS10' | 'DGS2' | 'UNRATE' | 'CPIAUCSL';
  id: 'us10y' | 'us2y' | 'unemployment' | 'cpi';
  label: string;
  category: Indicator['category'];
  unit: string;
};

const SERIES: FredMap[] = [
  { seriesId: 'DGS10', id: 'us10y', label: 'US 10Y Yield', category: 'rates', unit: '%' },
  { seriesId: 'DGS2', id: 'us2y', label: 'US 2Y Yield', category: 'rates', unit: '%' },
  { seriesId: 'UNRATE', id: 'unemployment', label: 'US Unemployment', category: 'growth', unit: '%' },
  { seriesId: 'CPIAUCSL', id: 'cpi', label: 'US CPI', category: 'inflation', unit: 'index' },
];

export async function fetchFred(): Promise<Indicator[]> {
  const key = process.env.FRED_API_KEY;
  if (!key) return [];

  try {
    const out: Indicator[] = [];
    for (const s of SERIES) {
      const j = await fetchJson(`https://api.stlouisfed.org/fred/series/observations?series_id=${s.seriesId}&api_key=${key}&file_type=json&sort_order=desc&limit=2`);
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
        status: 'live',
      });
    }

    const us10y = out.find((x) => x.id === 'us10y')?.value;
    const us2y = out.find((x) => x.id === 'us2y')?.value;
    if (us10y !== null && us10y !== undefined && us2y !== null && us2y !== undefined) {
      out.push({
        id: 'yield_spread_10y_2y',
        label: '10Y-2Y Spread',
        category: 'growth',
        value: us10y - us2y,
        unit: 'pp',
        date: out.find((x) => x.id === 'us10y')?.date ?? null,
        source: 'FRED',
        status: 'live',
      });
    }
    return out;
  } catch {
    return [];
  }
}
