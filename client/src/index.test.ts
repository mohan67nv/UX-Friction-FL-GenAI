import { describe, expect, it } from 'vitest';

import { ZeroBannerAnalytics } from './index';

// jsdom provides document/window

describe('ZeroBannerAnalytics SDK (MVP)', () => {
  it('constructs with strictNoPersistence default', () => {
    const a = new ZeroBannerAnalytics({
      apiKey: 'x'.repeat(20),
      apiBaseUrl: 'http://localhost:8000'
    });
    expect(a).toBeTruthy();
  });
});
