import { describe, expect, it } from 'vitest';

import { safeReturnTo } from './signout';

describe('safeReturnTo', () => {
  const origins = ['http://localhost:8502', 'https://ai.mcit.gov.eg'];

  it('accepts MCIT AI addresses', () => {
    expect(safeReturnTo('http://localhost:8502/login', origins)).toBe(
      'http://localhost:8502/login',
    );
    expect(safeReturnTo('https://ai.mcit.gov.eg/login?x=1', origins)).toBe(
      'https://ai.mcit.gov.eg/login?x=1',
    );
  });

  it('rejects other origins, schemes and junk', () => {
    expect(safeReturnTo('https://evil.example/login', origins)).toBeNull();
    expect(safeReturnTo('http://localhost:8502.evil.example/', origins)).toBeNull();
    expect(safeReturnTo('javascript:alert(1)', origins)).toBeNull();
    expect(safeReturnTo('/login', origins)).toBeNull();
    expect(safeReturnTo(null, origins)).toBeNull();
  });
});
