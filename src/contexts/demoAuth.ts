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
