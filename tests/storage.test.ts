import { describe, it, expect, vi, beforeEach } from 'vitest';

const readFile = vi.fn();
const writeFile = vi.fn();
const mkdir = vi.fn();

vi.mock('node:fs/promises', () => ({ default: { readFile, writeFile, mkdir } }));

describe('storage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.VERCEL;
  });

  it('loadSnapshots returns [] if file absent/invalid', async () => {
    readFile.mockRejectedValueOnce(new Error('missing')).mockResolvedValueOnce('invalid');
    const mod = await import('../src/lib/storage');
    expect(await mod.loadSnapshots()).toEqual([]);
    expect(await mod.loadSnapshots()).toEqual([]);
  });

  it('saveSnapshot writes in non-vercel', async () => {
    readFile.mockRejectedValue(new Error('missing'));
    const mod = await import('../src/lib/storage');
    await mod.saveSnapshot({ date: 'x', globalRiskScore: 1, riskRegime: 'Normal', ratesStressScore: 1, inflationStressScore: 1, growthStressScore: 1, marketStressScore: 1, geopoliticalStressScore: 1, cryptoRiskScore: 1, commodityRiskScore: 1, marketCards: [], alerts: [], positiveDrivers: [], negativeDrivers: [], indicators: [] });
    expect(mkdir).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
  });

  it('saveSnapshot does not write on vercel', async () => {
    process.env.VERCEL = '1';
    const mod = await import('../src/lib/storage');
    await mod.saveSnapshot({ date: 'x', globalRiskScore: 1, riskRegime: 'Normal', ratesStressScore: 1, inflationStressScore: 1, growthStressScore: 1, marketStressScore: 1, geopoliticalStressScore: 1, cryptoRiskScore: 1, commodityRiskScore: 1, marketCards: [], alerts: [], positiveDrivers: [], negativeDrivers: [], indicators: [] });
    expect(writeFile).not.toHaveBeenCalled();
  });
});
