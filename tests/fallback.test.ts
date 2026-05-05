import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/lib/data-sources/fred', () => ({ fetchFred: vi.fn(async () => []) }));
vi.mock('../src/lib/data-sources/coingecko', () => ({ fetchCoinGecko: vi.fn(async () => []) }));
vi.mock('../src/lib/data-sources/gdelt', () => ({ fetchGdelt: vi.fn(async () => []) }));
vi.mock('../src/lib/data-sources/alphavantage', () => ({ fetchAlphaVantage: vi.fn(async () => []) }));

import { fetchAllIndicators } from '../src/lib/data-sources';

describe('fallback aggregation', () => {
  it('returns per-source mock fallback', async () => {
    const data = await fetchAllIndicators();
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((x) => x.status === 'mock')).toBe(true);
    expect(data.some((x) => x.id === 'us10y')).toBe(true);
    expect(data.some((x) => x.id === 'btc')).toBe(true);
    expect(data.some((x) => x.id === 'gdelt_volume')).toBe(true);
    expect(data.some((x) => x.id === 'wti')).toBe(true);
  });
});
