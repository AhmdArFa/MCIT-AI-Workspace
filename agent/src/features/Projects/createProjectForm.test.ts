import { describe, expect, it } from 'vitest';

import {
  getCreateProjectInput,
  getProjectFieldSuggestions,
  isProjectIdentifierValid,
  isProjectSlugValid,
} from './createProjectForm';

describe('createProjectForm', () => {
  it('derives a valid identifier and slug from the project name', () => {
    expect(getProjectFieldSuggestions('MCIT AI')).toEqual({
      identifier: 'MCIT',
      slug: 'mcit-ai',
    });
    expect(getProjectFieldSuggestions('MCIT AI Mobile')).toEqual({
      identifier: 'MAM',
      slug: 'mcit-ai-mobile',
    });
    expect(getProjectFieldSuggestions('用户记忆')).toEqual({
      identifier: 'YHJY',
      slug: 'yong-hu-ji-yi',
    });
  });

  it('returns empty suggestions when the project name is empty', () => {
    expect(getProjectFieldSuggestions('  ')).toEqual({ identifier: '', slug: '' });
  });

  it('validates the identifier format shown by the form', () => {
    expect(isProjectIdentifierValid('TUT')).toBe(true);
    expect(isProjectIdentifierValid('LH')).toBe(false);
    expect(isProjectIdentifierValid('1TUT')).toBe(false);
  });

  it('normalizes and includes a user-provided slug', () => {
    expect(
      getCreateProjectInput({
        identifier: ' tut ',
        name: '  MCIT AI Project  ',
        slug: '  Mcit-Project  ',
      }),
    ).toEqual({
      identifier: 'TUT',
      name: 'MCIT AI Project',
      slug: 'mcit-project',
    });
  });

  it('omits an empty slug so the backend can generate one', () => {
    expect(
      getCreateProjectInput({ identifier: 'TUT', name: 'MCIT AI Project', slug: '  ' }),
    ).toEqual({ identifier: 'TUT', name: 'MCIT AI Project' });
  });

  it('rejects malformed slugs', () => {
    expect(isProjectSlugValid('two--hyphens')).toBe(false);
    expect(isProjectSlugValid('contains spaces')).toBe(false);
    expect(
      getCreateProjectInput({ identifier: 'TUT', name: 'MCIT AI Project', slug: '-invalid' }),
    ).toBeNull();
  });
});
