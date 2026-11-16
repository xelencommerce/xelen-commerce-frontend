import { describe, expect, it } from 'vitest';
import { parseEnv } from './env';

describe('frontend environment', () => {
  it.each([undefined, '', '   '])(
    'allows an unconfigured backend (%s)',
    (value) => {
      expect(parseEnv({ VITE_API_BASE_URL: value }).apiBaseUrl).toBeUndefined();
    },
  );

  it('accepts and trims an absolute HTTP(S) URL', () => {
    expect(
      parseEnv({ VITE_API_BASE_URL: ' https://backend.example.test/v1 ' })
        .apiBaseUrl,
    ).toBe('https://backend.example.test/v1');
  });

  it.each(['/relative', 'not a URL', 'ftp://backend.example.test'])(
    'rejects invalid configuration (%s)',
    (value) => {
      expect(() => parseEnv({ VITE_API_BASE_URL: value })).toThrow(
        'Invalid VITE_API_BASE_URL',
      );
    },
  );
});
