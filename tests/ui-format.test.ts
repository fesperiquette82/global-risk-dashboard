import { describe, it, expect } from 'vitest';
import { regimeColor, biasColor, statusColor, pct } from '../src/lib/ui/format';

describe('ui format utils', () => {
  it('maps regime colors', () => {
    expect(regimeColor('Risk-on')).toContain('emerald');
    expect(regimeColor('Crise')).toContain('red');
  });

  it('maps bias/status colors', () => {
    expect(biasColor('bullish')).toContain('emerald');
    expect(statusColor('mock')).toContain('slate');
    expect(statusColor('error')).toContain('red');
  });

  it('formats optional percentages', () => {
    expect(pct(undefined)).toBe('0.0');
    expect(pct(2.34)).toBe('2.3');
  });
});
