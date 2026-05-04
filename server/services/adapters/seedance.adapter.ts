import type { GenerationAdapter, AdapterOptions } from './base.adapter.js';

export const seedanceAdapter: GenerationAdapter = {
  provider: 'seedance',

  async submitTask(prompt: string, options: AdapterOptions): Promise<string> {
    const body: Record<string, unknown> = {
      prompt,
      duration: options.duration || 5,
    };

    if (options.imageUrl) {
      body.image_url = options.imageUrl;
    }

    const response = await fetch(`${options.apiUrl}/v1/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Seedance API error ${response.status}: ${text}`);
    }

    const data = await response.json() as any;
    return data.task_id || data.id || `sd_${Date.now()}`;
  },

  async queryResult(remoteTaskId: string, options: AdapterOptions): Promise<string | null> {
    const response = await fetch(`${options.apiUrl}/v1/video/result/${remoteTaskId}`, {
      headers: { Authorization: `Bearer ${options.apiKey}` },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const data = await response.json() as any;
    if (data.status === 'completed' || data.state === 'completed') {
      return data.result_url || data.video_url || data.url || null;
    }
    // Return null to continue polling while processing
    return null;
  },
};
