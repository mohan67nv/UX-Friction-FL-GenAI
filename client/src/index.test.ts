import { describe, expect, it } from 'vitest';

import { PrivacyEdgeAnalytics } from './index';

// jsdom provides document/window

describe('PrivacyEdgeAnalytics SDK (MVP)', () => {
  it('constructs with strictNoPersistence default', () => {
    const a = new PrivacyEdgeAnalytics({
      apiKey: 'x'.repeat(20),
      apiBaseUrl: 'http://localhost:8000'
    });
    expect(a).toBeTruthy();
  });
});
