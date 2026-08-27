import { describe, it, expect } from 'vitest';
import { computeDashboardModel } from '../src/lib/scoring';
import { mockIndicators } from '../src/lib/data-sources/mock';

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
