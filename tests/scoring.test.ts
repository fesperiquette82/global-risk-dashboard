import { describe, it, expect } from 'vitest';
import { computeDashboardModel, computeMarketSentiment } from '../src/lib/scoring';
import { mockIndicators } from '../src/lib/data-sources/mock';
import { AssetSignal } from '../src/lib/types';

const spySignal = (priceVsSma50Pct: number): AssetSignal => ({
  ticker: 'SPY', name: 'SPY', price: 500, changePct1d: 0, return3m: 0, priceVsSma50Pct,
  trend: 'neutre', realizedVolAnnualizedPct: 10, peRatio: 20, dividendYieldPct: 1.5, week52High: 550, week52Low: 400, status: 'live', asOf: '2025-01-01',
});

describe('scoring', () => {
  it('bounds global/sub scores to 0..100', () => {
    const m = computeDashboardModel(mockIndicators());
    const values = [m.globalRiskScore, m.ratesStressScore, m.inflationStressScore, m.growthStressScore, m.marketStressScore, m.geopoliticalStressScore, m.cryptoRiskScore, m.commodityRiskScore, m.creditStressScore];
    values.forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    values.forEach((v) => expect(v).toBeLessThanOrEqual(100));
  });

  it('market card stress scores are bounded and match bias thresholds', () => {
    const m = computeDashboardModel(mockIndicators());
    m.marketCards.forEach((c) => {
      expect(c.stressScore).toBeGreaterThanOrEqual(0);
      expect(c.stressScore).toBeLessThanOrEqual(100);
      if (c.stressScore > 60) expect(c.bias).toBe('bearish');
      if (c.stressScore < 40) expect(c.bias).toBe('bullish');
    });
  });

  it('credit stress score reflects real high-yield spread levels', () => {
    const calm = computeDashboardModel([{ id: 'credit_spread_hy', label: '', category: 'credit', value: 3, unit: 'pp', date: null, source: 'x', status: 'live' }]);
    const crisis = computeDashboardModel([{ id: 'credit_spread_hy', label: '', category: 'credit', value: 8, unit: 'pp', date: null, source: 'x', status: 'live' }]);
    expect(calm.creditStressScore).toBe(0);
    expect(crisis.creditStressScore).toBe(100);
  });

  it('regime mapping and bias thresholds', () => {
    expect(computeDashboardModel([{ id: 'gdelt_volume', label: '', category: 'geopolitics', value: 0, unit: '', date: null, source: 'x', status: 'mock' }]).riskRegime).toBe('Risk-on');
    expect(computeDashboardModel([{ id: 'gdelt_volume', label: '', category: 'geopolitics', value: 40, unit: '', date: null, source: 'x', status: 'mock' }]).riskRegime).toBe('Normal');
    expect(computeDashboardModel([{ id: 'gdelt_volume', label: '', category: 'geopolitics', value: 55, unit: '', date: null, source: 'x', status: 'mock' }]).riskRegime).toBe('Fragile');
    expect(computeDashboardModel([{ id: 'gdelt_volume', label: '', category: 'geopolitics', value: 70, unit: '', date: null, source: 'x', status: 'mock' }]).riskRegime).toBe('Stress élevé');
    expect(computeDashboardModel([{ id: 'gdelt_volume', label: '', category: 'geopolitics', value: 95, unit: '', date: null, source: 'x', status: 'mock' }]).riskRegime).toBe('Crise');
  });
});

describe('computeMarketSentiment', () => {
  const withVixAndCredit = (vix: number, creditSpread: number) => computeDashboardModel([
    { id: 'vix', label: '', category: 'volatility', value: vix, unit: 'index', date: null, source: 'x', status: 'live' },
    { id: 'credit_spread_hy', label: '', category: 'credit', value: creditSpread, unit: 'pp', date: null, source: 'x', status: 'live' },
  ]);

  it('scores extreme fear when volatility, credit stress and momentum are all bad', () => {
    const model = withVixAndCredit(37, 8);
    const s = computeMarketSentiment(model, spySignal(-10));
    expect(s.score).toBe(0);
    expect(s.label).toBe('Peur extrême');
  });

  it('scores extreme greed when volatility, credit stress and momentum are all good', () => {
    const model = withVixAndCredit(12, 3);
    const s = computeMarketSentiment(model, spySignal(10));
    expect(s.score).toBe(100);
    expect(s.label).toBe('Avidité extrême');
  });

  it('falls back to neutral momentum (50) when no SPY signal is available', () => {
    const model = withVixAndCredit(12, 3);
    const withMomentum = computeMarketSentiment(model, spySignal(0));
    const withoutTicker = computeMarketSentiment(model, undefined);
    expect(withoutTicker.components.momentum).toBe(50);
    expect(withoutTicker.score).toBe(withMomentum.score);
  });

  it('bounds every component to 0..100 regardless of extreme inputs', () => {
    const model = withVixAndCredit(90, 25);
    const s = computeMarketSentiment(model, spySignal(-50));
    Object.values(s.components).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });
});
