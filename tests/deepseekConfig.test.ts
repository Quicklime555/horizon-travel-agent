import test from 'node:test';
import assert from 'node:assert/strict';

import { getDeepSeekConfig } from '../src/ai/deepseekConfig.ts';

test('getDeepSeekConfig reads api key and model from env', () => {
  const config = getDeepSeekConfig({
    DEEPSEEK_API_KEY: 'sk-demo',
    DEEPSEEK_MODEL: 'DeepSeekv4flash',
    DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
  });

  assert.deepEqual(config, {
    apiKey: 'sk-demo',
    model: 'DeepSeekv4flash',
    baseUrl: 'https://api.deepseek.com',
  });
});

test('getDeepSeekConfig falls back to official defaults', () => {
  const config = getDeepSeekConfig({
    DEEPSEEK_API_KEY: 'sk-demo',
  });

  assert.deepEqual(config, {
    apiKey: 'sk-demo',
    model: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com',
  });
});
