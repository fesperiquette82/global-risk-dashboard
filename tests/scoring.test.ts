import { describe, it, expect } from 'vitest';
import { computeDashboardModel, roundToStepAndClamp } from '../src/lib/scoring';
import { mockIndicators } from '../src/lib/data-sources/mock';

describe('scoring', () => {
  it('bounds global/sub scores to 0..100', () => {
    const m = computeDashboardModel(mockIndicators());
    const values = [m.globalRiskScore, m.ratesStressScore, m.inflationStressScore, m.growthStressScore, m.marketStressScore, m.geopoliticalStressScore, m.cryptoRiskScore, m.commodityRiskScore];
    values.forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    values.forEach((v) => expect(v).toBeLessThanOrEqual(100));
  });

  it('probabilities are rounded by 5 and bounded', () => {
    const m = computeDashboardModel(mockIndicators());
    m.marketCards.forEach((c) => {
      [c.up1m, c.down1m, c.up6m].forEach((p) => {
        expect(p % 5).toBe(0);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
      });
    });
    expect(roundToStepAndClamp(103)).toBe(100);
    expect(roundToStepAndClamp(-11)).toBe(0);
  });

  it('regime mapping and bias thresholds', () => {
    expect(computeDashboardModel([{ id: 'gdelt_volume', label: '', category: 'geopolitics', value: 0, unit: '', date: null, source: 'x', status: 'mock' }]).riskRegime).toBe('Risk-on');
    expect(computeDashboardModel([{ id: 'gdelt_volume', label: '', category: 'geopolitics', value: 40, unit: '', date: null, source: 'x', status: 'mock' }]).riskRegime).toBe('Normal');
    expect(computeDashboardModel([{ id: 'gdelt_volume', label: '', category: 'geopolitics', value: 55, unit: '', date: null, source: 'x', status: 'mock' }]).riskRegime).toBe('Fragile');
    expect(computeDashboardModel([{ id: 'gdelt_volume', label: '', category: 'geopolitics', value: 70, unit: '', date: null, source: 'x', status: 'mock' }]).riskRegime).toBe('Stress élevé');
    expect(computeDashboardModel([{ id: 'gdelt_volume', label: '', category: 'geopolitics', value: 95, unit: '', date: null, source: 'x', status: 'mock' }]).riskRegime).toBe('Crise');
  });
});
