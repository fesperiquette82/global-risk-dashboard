import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sma, realizedVolAnnualizedPct, trendFromSma, fetchAssetSignals, watchlistTickers } from '../src/lib/data-sources/equities';

beforeEach(() => {
  vi.restoreAllMocks();
  delete process.env.ALPHA_VANTAGE_API_KEY;
  delete process.env.PORTFOLIO_TICKERS;
});

describe('equities math helpers', () => {
  it('sma averages the N most recent closes and requires enough history', () => {
    const closesDesc = Array(50).fill(100);
    expect(sma(closesDesc, 50)).toBe(100);
    expect(sma(closesDesc, 51)).toBeNull();
  });

  it('realizedVolAnnualizedPct is 0 for a flat series and null without enough history', () => {
    const flat = Array(31).fill(100);
    expect(realizedVolAnnualizedPct(flat, 30)).toBe(0);
    expect(realizedVolAnnualizedPct(Array(10).fill(100), 30)).toBeNull();
  });

  it('trendFromSma applies the +/-2% thresholds', () => {
    expect(trendFromSma(null)).toBe('neutre');
    expect(trendFromSma(2.1)).toBe('haussière');
    expect(trendFromSma(-2.1)).toBe('baissière');
    expect(trendFromSma(0)).toBe('neutre');
  });
});

describe('watchlistTickers', () => {
  it('defaults to a broad ETF set and parses a custom comma-separated list', () => {
    expect(watchlistTickers()).toEqual(['SPY', 'QQQ', 'VTI', 'IWM', 'EFA']);
    process.env.PORTFOLIO_TICKERS = ' aapl, msft ,,';
    expect(watchlistTickers()).toEqual(['AAPL', 'MSFT']);
  });
});

describe('fetchAssetSignals', () => {
  it('returns mock signals for every ticker when no API key is configured', async () => {
    const signals = await fetchAssetSignals(0);
    expect(signals).toHaveLength(5);
    expect(signals.every((s) => s.status === 'mock' && s.price === null)).toBe(true);
  });

  it('returns a live signal built from real Alpha Vantage responses', async () => {
    process.env.ALPHA_VANTAGE_API_KEY = 'k';
    process.env.PORTFOLIO_TICKERS = 'TEST';
    const dailySeries: Record<string, { '4. close': string }> = {};
    for (let i = 0; i < 60; i++) dailySeries[`2025-01-${String(i + 1).padStart(2, '0')}`] = { '4. close': String(100 + i) };
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('function=OVERVIEW')) return Promise.resolve({ ok: true, json: async () => ({ Name: 'Test Corp', PERatio: '22.5', DividendYield: '0.015', '52WeekHigh': '160', '52WeekLow': '95' }) });
      return Promise.resolve({ ok: true, json: async () => ({ 'Time Series (Daily)': dailySeries }) });
    }));
    const [signal] = await fetchAssetSignals(0);
    expect(signal.status).toBe('live');
    expect(signal.name).toBe('Test Corp');
    expect(signal.peRatio).toBe(22.5);
    expect(signal.dividendYieldPct).toBeCloseTo(1.5);
    expect(signal.price).toBeGreaterThan(0);
    expect(signal.trend).toBe('haussière'); // monotonically rising series
  });

  it('falls back to a mock signal when the response is malformed', async () => {
    process.env.ALPHA_VANTAGE_API_KEY = 'k';
    process.env.PORTFOLIO_TICKERS = 'TEST';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    const [signal] = await fetchAssetSignals(0);
    expect(signal.status).toBe('mock');
  });

  it('fetches tickers one at a time instead of bursting - Alpha Vantage silently rate-limits parallel bursts', async () => {
    process.env.ALPHA_VANTAGE_API_KEY = 'k';
    process.env.PORTFOLIO_TICKERS = 'AAA,BBB';
    let concurrent = 0;
    let maxConcurrent = 0;
    vi.stubGlobal('fetch', vi.fn(async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await Promise.resolve();
      concurrent--;
      return { ok: true, json: async () => ({}) };
    }));
    const signals = await fetchAssetSignals(0);
    expect(signals).toHaveLength(2);
    // 2 concurrent calls per ticker (OVERVIEW + TIME_SERIES_DAILY) is expected;
    // 4 (both tickers at once) would mean the burst is back.
    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });
});
