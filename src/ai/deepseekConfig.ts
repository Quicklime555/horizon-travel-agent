interface DeepSeekEnv {
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
  DEEPSEEK_BASE_URL?: string;
}

export interface DeepSeekConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export function getDeepSeekConfig(env: DeepSeekEnv): DeepSeekConfig {
  return {
    apiKey: env.DEEPSEEK_API_KEY?.trim() ?? '',
    model: env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat',
    baseUrl: env.DEEPSEEK_BASE_URL?.trim() || 'https://api.deepseek.com',
  };
}
