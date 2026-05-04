import type { GenerationAdapter, AdapterOptions } from './base.adapter.js';

export const nanobananaAdapter: GenerationAdapter = {
  provider: 'nanobanana',

  async submitTask(prompt: string, options: AdapterOptions): Promise<string> {
    const response = await fetch(`${options.apiUrl}/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({ prompt, num_images: 1 }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Nanobanana API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.task_id || data.id || `nb_${Date.now()}`;
  },

  async queryResult(remoteTaskId: string, options: AdapterOptions): Promise<string | null> {
    const response = await fetch(`${options.apiUrl}/v1/result/${remoteTaskId}`, {
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
