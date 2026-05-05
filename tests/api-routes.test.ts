import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/lib/storage', () => ({
  loadSnapshots: vi.fn(async () => []),
  saveSnapshot: vi.fn(async () => undefined),
}));
vi.mock('../src/lib/data-sources', () => ({ fetchAllIndicators: vi.fn(async () => []) }));

import { GET } from '../src/app/api/dashboard/route';
import { POST } from '../src/app/api/refresh/route';

describe('api routes', () => {
  it('GET /api/dashboard returns model', async () => {
    const res = await GET();
    const body = await res.json();
    expect(body).toHaveProperty('globalRiskScore');
  });

  it('POST /api/refresh returns model without keys', async () => {
    const res = await POST();
    const body = await res.json();
    expect(body).toHaveProperty('riskRegime');
  });
});
