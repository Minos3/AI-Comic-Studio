import type { GenerationAdapter, AdapterOptions } from './base.adapter.js';

export const jimengAdapter: GenerationAdapter = {
  provider: 'jimeng',

  async submitTask(prompt: string, options: AdapterOptions): Promise<string> {
    const response = await fetch(`${options.apiUrl}/api/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({ prompt, n: 1, size: '1024x1024' }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Jimeng API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.task_id || data.id || `jm_${Date.now()}`;
  },

  async queryResult(remoteTaskId: string, options: AdapterOptions): Promise<string | null> {
    const response = await fetch(`${options.apiUrl}/api/v1/images/result/${remoteTaskId}`, {
      headers: { Authorization: `Bearer ${options.apiKey}` },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const data = await response.json() as any;
    if (data.status === 'completed') {
      return data.result_url || data.url || null;
    }
    return null;
  },
};
