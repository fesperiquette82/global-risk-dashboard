import { Indicator } from '@/lib/types';
import { fetchJson } from './utils';

export async function fetchGdelt(): Promise<Indicator[]> {
  try {
    const q = 'war OR oil OR inflation OR recession OR Taiwan OR Ukraine OR "Middle East"';
    const u = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=artlist&format=json&maxrecords=50`;
    // GDELT's free doc API is often slower than the other sources' default timeout.
    // Kept under 10s: Vercel's default serverless function limit would hard-kill
    // the whole request (not just this call) rather than let it fall back to mock.
    const j = await fetchJson(u, 9500);
    const n = Array.isArray(j?.articles) ? j.articles.length : 0;
    return [{ id: 'gdelt_volume', label: 'GDELT Keyword Volume', category: 'geopolitics', value: n, unit: 'articles', date: new Date().toISOString(), source: 'GDELT', status: 'live' }];
  } catch {
    return [];
  }
}
