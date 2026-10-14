import { describe, expect, it } from 'vitest';

import { isOfficialCloudServer } from './url';

describe('isOfficialCloudServer', () => {
  it.each([
    'https://mcit.gov.eg',
    'https://mcit.gov.eg',
    'https://mcit.gov.eg/workspace',
    'https://staging.app.mcit.gov.eg/',
  ])('treats %s as official', (url) => {
    expect(isOfficialCloudServer(url)).toBe(true);
  });

  it.each([
    'https://mcit.gov.eg.evil.example',
    'https://notlobehub.com',
    'https://my-mcit.internal',
    'http://localhost:3210',
    'not a url',
    '',
    undefined,
  ])('treats %s as self-hosted', (url) => {
    expect(isOfficialCloudServer(url)).toBe(false);
  });
});
