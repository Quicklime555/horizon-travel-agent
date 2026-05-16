import test from 'node:test';
import assert from 'node:assert/strict';

import { getDemoAuthConfig } from '../src/contexts/demoAuth.ts';

test('getDemoAuthConfig returns enabled demo credentials when all required env values exist', () => {
  const config = getDemoAuthConfig({
    VITE_DEMO_MODE: 'true',
    VITE_DEMO_EMAIL: 'demo@example.com',
    VITE_DEMO_PASSWORD: 'secret-demo-password',
  });

  assert.deepEqual(config, {
    enabled: true,
    email: 'demo@example.com',
    password: 'secret-demo-password',
  });
});

test('getDemoAuthConfig disables demo mode when credentials are incomplete', () => {
  const config = getDemoAuthConfig({
    VITE_DEMO_MODE: 'true',
    VITE_DEMO_EMAIL: 'demo@example.com',
  });

  assert.deepEqual(config, {
    enabled: false,
    email: '',
    password: '',
  });
});
