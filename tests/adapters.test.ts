import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchFred } from '../src/lib/data-sources/fred';
import { fetchCoinGecko } from '../src/lib/data-sources/coingecko';
import { fetchGdelt } from '../src/lib/data-sources/gdelt';
import { fetchAlphaVantage } from '../src/lib/data-sources/alphavantage';

beforeEach(() => vi.restoreAllMocks());

describe('adapters', () => {
  it('fred normalizes ids for all real series, including the direct 10Y-2Y spread', async () => {
    process.env.FRED_API_KEY = 'k';
    // Order must match SERIES in fred.ts: DGS10, DGS2, T10Y2Y, UNRATE, CPIAUCSL, VIXCLS, BAMLH0A0HYM2.
    const responses = [
      { observations: [{ value: '4.5', date: '2025-01-01' }] },
      { observations: [{ value: '4.0', date: '2025-01-01' }] },
      { observations: [{ value: '0.5', date: '2025-01-01' }] },
      { observations: [{ value: '4.2', date: '2025-01-01' }] },
      { observations: [{ value: '3.1', date: '2025-01-01' }] },
      { observations: [{ value: '18.5', date: '2025-01-01' }] },
      { observations: [{ value: '3.8', date: '2025-01-01' }] },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => responses.shift() }));
    const d = await fetchFred();
    expect(d.find((x) => x.id === 'us10y')).toBeTruthy();
    expect(d.find((x) => x.id === 'us2y')).toBeTruthy();
    expect(d.find((x) => x.id === 'unemployment')).toBeTruthy();
    expect(d.find((x) => x.id === 'yield_spread_10y_2y')?.value).toBe(0.5);
    expect(d.find((x) => x.id === 'cpi_yoy')?.value).toBe(3.1);
    expect(d.find((x) => x.id === 'vix')?.value).toBe(18.5);
    expect(d.find((x) => x.id === 'credit_spread_hy')?.value).toBe(3.8);
  });

  it('fred marks a missing observation ("." from the API) as error status, not live', async () => {
    process.env.FRED_API_KEY = 'k';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ observations: [{ value: '.', date: '2025-01-01' }] }) }));
    const d = await fetchFred();
    expect(d.every((x) => x.value === null && x.status === 'error')).toBe(true);
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
