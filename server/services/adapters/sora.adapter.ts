import type { GenerationAdapter, AdapterOptions } from './base.adapter.js';

// Sora video generation — /v1/videos
export const soraAdapter: GenerationAdapter = {
  provider: 'sora',

  async submitTask(prompt: string, options: AdapterOptions): Promise<string> {
    const baseUrl = options.apiUrl || 'https://aigc.x-see.cn';
    const url = `${baseUrl}/v1/videos`;

    const body: Record<string, unknown> = {
      model: options.configJson?.model || 'sora-2',
      prompt,
    };

    if (options.imageUrl) {
      body.input_reference = { image_url: options.imageUrl };
    }

    const response = await fetch(url, {
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
      throw new Error(`Sora API error ${response.status}: ${text}`);
    }

    const data = await response.json() as any;
    const taskId = data.id || data.task_id;
    if (!taskId) throw new Error(`Sora: no task ID in response: ${JSON.stringify(data)}`);

    return taskId;
  },

  async queryResult(remoteTaskId: string, options: AdapterOptions): Promise<string | null> {
    const baseUrl = options.apiUrl || 'https://aigc.x-see.cn';
    const url = `${baseUrl}/v1/videos/${remoteTaskId}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${options.apiKey}` },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const data = await response.json() as any;
    if (data.status === 'completed') {
      return data.video_url || data.result_url || data.url || data.output_url || null;
    }
    if (data.status === 'failed') return null;
    // Still processing
    return null;
  },
};
