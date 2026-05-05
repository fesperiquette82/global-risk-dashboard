import { Indicator } from '@/lib/types';
import { fetchJson } from './utils';

export async function fetchAlphaVantage(): Promise<Indicator[]> {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return [];
  try {
    const j = await fetchJson(`https://www.alphavantage.co/query?function=WTI&interval=monthly&apikey=${key}`);
    const v = Number(j?.data?.[0]?.value);
    if (!Number.isFinite(v)) return [];
    return [{ id: 'wti', label: 'WTI Oil', category: 'commodities', value: v, unit: 'USD', date: j.data?.[0]?.date ?? null, source: 'Alpha Vantage', status: 'live' }];
  } catch {
    return [];
  }
}
