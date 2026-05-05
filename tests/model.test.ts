import { describe,it,expect } from 'vitest';
import { computeDashboardModel } from '../src/lib/scoring';
import { mockIndicators } from '../src/lib/data-sources/mock';
describe('model',()=>{it('contains required fields',()=>{const m=computeDashboardModel(mockIndicators()); expect(m).toHaveProperty('riskRegime'); expect(Array.isArray(m.indicators)).toBe(true);});});
