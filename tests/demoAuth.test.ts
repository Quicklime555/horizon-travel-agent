import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getDemoAuthConfig,
  getDemoEntryConfig,
  signInWithDemoAccount,
} from '../src/contexts/demoAuth.ts';

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

test('getDemoEntryConfig enables guest login but keeps auto sign-in disabled', () => {
  const config = getDemoEntryConfig({
    VITE_DEMO_MODE: 'true',
    VITE_DEMO_EMAIL: 'demo@example.com',
    VITE_DEMO_PASSWORD: 'secret-demo-password',
  });

  assert.deepEqual(config, {
    guestLoginEnabled: true,
    autoSignInEnabled: false,
  });
});

test('signInWithDemoAccount uses configured demo credentials', async () => {
  const calls: Array<{ email: string; password: string }> = [];
  const authClient = {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      calls.push(credentials);
      return { data: { session: null }, error: null };
    },
  };

  await signInWithDemoAccount(authClient, {
    VITE_DEMO_MODE: 'true',
    VITE_DEMO_EMAIL: 'demo@example.com',
    VITE_DEMO_PASSWORD: 'secret-demo-password',
  });

  assert.deepEqual(calls, [
    {
      email: 'demo@example.com',
      password: 'secret-demo-password',
    },
  ]);
});

test('signInWithDemoAccount throws when demo credentials are unavailable', async () => {
  const authClient = {
    signInWithPassword: async () => ({ data: { session: null }, error: null }),
  };

  await assert.rejects(
    () =>
      signInWithDemoAccount(authClient, {
        VITE_DEMO_MODE: 'true',
        VITE_DEMO_EMAIL: 'demo@example.com',
      }),
    /Demo account is not configured/
  );
});
