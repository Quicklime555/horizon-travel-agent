interface DemoAuthEnv {
  VITE_DEMO_MODE?: string;
  VITE_DEMO_EMAIL?: string;
  VITE_DEMO_PASSWORD?: string;
}

export interface DemoAuthConfig {
  enabled: boolean;
  email: string;
  password: string;
}

export interface DemoEntryConfig {
  guestLoginEnabled: boolean;
  autoSignInEnabled: boolean;
}

interface DemoAuthClient {
  signInWithPassword(credentials: {
    email: string;
    password: string;
  }): Promise<unknown>;
}

export function getDemoAuthConfig(env: DemoAuthEnv): DemoAuthConfig {
  const enabled = env.VITE_DEMO_MODE === 'true';
  const email = env.VITE_DEMO_EMAIL?.trim() ?? '';
  const password = env.VITE_DEMO_PASSWORD?.trim() ?? '';

  if (!enabled || !email || !password) {
    return {
      enabled: false,
      email: '',
      password: '',
    };
  }

  return {
    enabled: true,
    email,
    password,
  };
}

export function getDemoEntryConfig(env: DemoAuthEnv): DemoEntryConfig {
  const demoAuth = getDemoAuthConfig(env);

  return {
    guestLoginEnabled: demoAuth.enabled,
    autoSignInEnabled: false,
  };
}

export async function signInWithDemoAccount(authClient: DemoAuthClient, env: DemoAuthEnv) {
  const demoAuth = getDemoAuthConfig(env);

  if (!demoAuth.enabled) {
    throw new Error('Demo account is not configured');
  }

  return authClient.signInWithPassword({
    email: demoAuth.email,
    password: demoAuth.password,
  });
}
