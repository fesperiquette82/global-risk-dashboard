import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchFred } from '../src/lib/data-sources/fred';
import { fetchCoinGecko } from '../src/lib/data-sources/coingecko';
import { fetchGdelt } from '../src/lib/data-sources/gdelt';
import { fetchAlphaVantage } from '../src/lib/data-sources/alphavantage';

beforeEach(() => vi.restoreAllMocks());

describe('adapters', () => {
  it('fred normalizes ids and computes spread', async () => {
    process.env.FRED_API_KEY = 'k';
    const responses = [
      { observations: [{ value: '4.5', date: '2025-01-01' }] },
      { observations: [{ value: '4.0', date: '2025-01-01' }] },
      { observations: [{ value: '4.2', date: '2025-01-01' }] },
      { observations: [{ value: '312.2', date: '2025-01-01' }] },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => responses.shift() }));
    const d = await fetchFred();
    expect(d.find((x) => x.id === 'us10y')).toBeTruthy();
    expect(d.find((x) => x.id === 'us2y')).toBeTruthy();
    expect(d.find((x) => x.id === 'unemployment')).toBeTruthy();
    expect(d.find((x) => x.id === 'cpi')).toBeTruthy();
    expect(d.find((x) => x.id === 'yield_spread_10y_2y')?.value).toBe(0.5);
  });

  it('fred handles no key/incomplete/error', async () => {
    delete process.env.FRED_API_KEY;
    expect(await fetchFred()).toEqual([]);
    process.env.FRED_API_KEY = 'k';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ observations: [] }) }));
    const d = await fetchFred();
    expect(Array.isArray(d)).toBe(true);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));
    expect(await fetchFred()).toEqual([]);
  });

  it('coingecko valid/incomplete/error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ bitcoin: { usd: 1, usd_24h_change: 2 } }) }));
    const a = await fetchCoinGecko();
    expect(a.find((x) => x.id === 'btc')?.status).toBe('live');
    expect(a.find((x) => x.id === 'eth')?.value).toBeNull();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('nope')));
    expect(await fetchCoinGecko()).toEqual([]);
  });

  it('gdelt articles/no-articles/error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ articles: [{}, {}] }) }));
    expect((await fetchGdelt())[0].value).toBe(2);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    expect((await fetchGdelt())[0].value).toBe(0);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('bad')));
    expect(await fetchGdelt()).toEqual([]);
  });

  it('alpha vantage no-key/valid/invalid', async () => {
    delete process.env.ALPHA_VANTAGE_API_KEY;
    expect(await fetchAlphaVantage()).toEqual([]);
    process.env.ALPHA_VANTAGE_API_KEY = 'k';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [{ value: '88', date: '2025-01-01' }] }) }));
    expect((await fetchAlphaVantage())[0].status).toBe('live');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [{ value: 'NaN' }] }) }));
    expect(await fetchAlphaVantage()).toEqual([]);
  });
});
