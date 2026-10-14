import { describe, expect, it } from 'vitest';

import { responsiveAvatarSize } from './responsiveSize';

describe('responsiveAvatarSize', () => {
  it('keeps desktop sizes', () => {
    for (const size of [16, 24, 32, 36, 40, 96])
      expect(responsiveAvatarSize(size, false)).toBe(size);
  });

  it('steps sizes down on mobile', () => {
    expect(responsiveAvatarSize(96, true)).toBe(72);
    expect(responsiveAvatarSize(64, true)).toBe(48);
    expect(responsiveAvatarSize(40, true)).toBe(32);
    expect(responsiveAvatarSize(36, true)).toBe(28);
    expect(responsiveAvatarSize(32, true)).toBe(28);
  });

  it('leaves small inline avatars alone', () => {
    expect(responsiveAvatarSize(24, true)).toBe(24);
    expect(responsiveAvatarSize(18, true)).toBe(18);
  });
});
