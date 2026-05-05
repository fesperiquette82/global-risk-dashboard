import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDailyBrief } from '../src/lib/ai';
import { computeDashboardModel } from '../src/lib/scoring';
import { mockIndicators } from '../src/lib/data-sources/mock';

const model = computeDashboardModel(mockIndicators());
beforeEach(() => vi.restoreAllMocks());

describe('daily brief', () => {
  it('fallback when no key', async () => {
    delete process.env.GEMINI_API_KEY;
    const b = await generateDailyBrief(model);
    expect(b.summary).toContain('Régime');
  });
  it('parses valid json from gemini', async () => {
    process.env.GEMINI_API_KEY = 'k';
    const payload = { summary: 'ok', positiveDrivers: [], negativeDrivers: [], alerts: [], mostExposedAssets: [], baseCase: 'b', riskCase: 'r', watchTomorrow: [] };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }] }) }));
    const b = await generateDailyBrief(model);
    expect(b.summary).toBe('ok');
  });
  it('fallback on invalid json or fetch error', async () => {
    process.env.GEMINI_API_KEY = 'k';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ candidates: [{ content: { parts: [{ text: '{bad' }] } }] }) }));
    expect((await generateDailyBrief(model)).summary).toContain('Régime');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('x')));
    expect((await generateDailyBrief(model)).summary).toContain('Régime');
  });
});
