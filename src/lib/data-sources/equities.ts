import { AssetSignal, TrendLabel } from '@/lib/types';
import { fetchJson, ALPHA_VANTAGE_REVALIDATE_SECONDS } from './utils';

const DEFAULT_TICKERS = ['SPY', 'QQQ', 'VTI', 'IWM', 'EFA'];

export function watchlistTickers(): string[] {
  const raw = process.env.PORTFOLIO_TICKERS;
  if (!raw) return DEFAULT_TICKERS;
  const list = raw.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);
  return list.length ? list : DEFAULT_TICKERS;
}

export function sma(closesDesc: number[], window: number): number | null {
  if (closesDesc.length < window) return null;
  return closesDesc.slice(0, window).reduce((a, b) => a + b, 0) / window;
}

// Annualized realized volatility from daily log returns (most-recent-first closes).
export function realizedVolAnnualizedPct(closesDesc: number[], window = 30): number | null {
  if (closesDesc.length < window + 1) return null;
  const rets = Array.from({ length: window }, (_, i) => Math.log(closesDesc[i] / closesDesc[i + 1]));
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1);
  return Math.sqrt(variance * 252) * 100;
}

export function trendFromSma(priceVsSmaPct: number | null): TrendLabel {
  if (priceVsSmaPct === null) return 'neutre';
  if (priceVsSmaPct > 2) return 'haussière';
  if (priceVsSmaPct < -2) return 'baissière';
  return 'neutre';
}

function mockSignal(ticker: string): AssetSignal {
  return { ticker, name: ticker, price: null, changePct1d: null, return3m: null, priceVsSma50Pct: null, trend: 'neutre', realizedVolAnnualizedPct: null, peRatio: null, dividendYieldPct: null, week52High: null, week52Low: null, status: 'mock', asOf: null };
}

async function fetchTicker(ticker: string, key: string): Promise<AssetSignal> {
  try {
    const [overview, series] = await Promise.all([
      fetchJson(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${key}`, 7000, ALPHA_VANTAGE_REVALIDATE_SECONDS),
      fetchJson(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${key}`, 7000, ALPHA_VANTAGE_REVALIDATE_SECONDS),
    ]);
    const daily = series?.['Time Series (Daily)'];
    if (!daily) return mockSignal(ticker);

    const dates = Object.keys(daily).sort().reverse();
    const closesDesc = dates.map((d) => Number(daily[d]['4. close']));
    const price = closesDesc[0];
    if (!Number.isFinite(price)) return mockSignal(ticker);

    const changePct1d = closesDesc.length > 1 ? ((price - closesDesc[1]) / closesDesc[1]) * 100 : null;
    const return3m = closesDesc.length > 63 ? ((price - closesDesc[63]) / closesDesc[63]) * 100 : null;
    const sma50 = sma(closesDesc, 50);
    const priceVsSma50Pct = sma50 ? ((price - sma50) / sma50) * 100 : null;

    const pe = Number(overview?.PERatio);
    // Alpha Vantage returns DividendYield as a fraction (e.g. "0.015" = 1.5%).
    const div = Number(overview?.DividendYield);
    const wk52h = Number(overview?.['52WeekHigh']);
    const wk52l = Number(overview?.['52WeekLow']);

    return {
      ticker,
      name: overview?.Name || ticker,
      price,
      changePct1d,
      return3m,
      priceVsSma50Pct,
      trend: trendFromSma(priceVsSma50Pct),
      realizedVolAnnualizedPct: realizedVolAnnualizedPct(closesDesc),
      peRatio: Number.isFinite(pe) ? pe : null,
      dividendYieldPct: Number.isFinite(div) ? div * 100 : null,
      week52High: Number.isFinite(wk52h) ? wk52h : null,
      week52Low: Number.isFinite(wk52l) ? wk52l : null,
      status: 'live',
      asOf: dates[0] ?? null,
    };
  } catch {
    return mockSignal(ticker);
  }
}

export async function fetchAssetSignals(): Promise<AssetSignal[]> {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  const tickers = watchlistTickers();
  if (!key) return tickers.map(mockSignal);
  return Promise.all(tickers.map((t) => fetchTicker(t, key)));
}
