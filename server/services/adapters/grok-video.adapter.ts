import type { GenerationAdapter, AdapterOptions } from './base.adapter.js';

// Grok Video — /v1/videos (multipart/form-data)
export const grokVideoAdapter: GenerationAdapter = {
  provider: 'grok-video',

  async submitTask(prompt: string, options: AdapterOptions): Promise<string> {
    const baseUrl = options.apiUrl || 'https://aigc.x-see.cn';
    const url = `${baseUrl}/v1/videos`;

    const formData = new FormData();
    formData.append('model', (options.configJson?.model as string) || 'grok-imagine-video');
    formData.append('prompt', prompt);
    formData.append('aspect_ratio', (options.configJson?.aspectRatio as string) || '16:9');
    formData.append('seconds', String(options.duration || options.configJson?.seconds || 6));
    formData.append('quality', (options.configJson?.quality as string) || 'standard');

    if (options.imageUrl) {
      formData.append('image', options.imageUrl);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: formData,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Grok Video API error ${response.status}: ${text}`);
    }

    const data = await response.json() as any;
    const taskId = data.id;
    if (!taskId) throw new Error(`Grok Video: no id in response: ${JSON.stringify(data)}`);

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
    if (data.status === 'failed' || data.status === 'error') return null;
    // Still queued/processing
    return null;
  },
};
