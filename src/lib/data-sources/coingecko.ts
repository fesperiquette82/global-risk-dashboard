import { Indicator } from '@/lib/types';
import { fetchJson } from './utils';

export async function fetchCoinGecko(): Promise<Indicator[]> {
  try {
    const j = await fetchJson('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
    return [
      { id: 'btc', label: 'Bitcoin', category: 'crypto', value: j?.bitcoin?.usd ?? null, unit: 'USD', date: new Date().toISOString(), source: 'CoinGecko', status: 'live', change1d: j?.bitcoin?.usd_24h_change ?? null },
      { id: 'eth', label: 'Ethereum', category: 'crypto', value: j?.ethereum?.usd ?? null, unit: 'USD', date: new Date().toISOString(), source: 'CoinGecko', status: 'live', change1d: j?.ethereum?.usd_24h_change ?? null },
    ];
  } catch {
    return [];
  }
}
