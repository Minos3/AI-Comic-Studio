import type { GenerationAdapter, AdapterOptions } from './base.adapter.js';

// GPT Image 2 — OpenAI-compatible /v1/images/generations
export const gptImageAdapter: GenerationAdapter = {
  provider: 'gpt-image',

  async submitTask(prompt: string, options: AdapterOptions): Promise<string> {
    const baseUrl = options.apiUrl || 'https://aigc.x-see.cn';
    const url = `${baseUrl}/v1/images/generations`;

    const body: Record<string, unknown> = {
      model: options.configJson?.model || 'gpt-image-2',
      prompt: prompt.substring(0, 1000),
      n: options.configJson?.n || 1,
      size: options.configJson?.size || '1024x1024',
    };

    if (options.imageUrl) {
      body.image = options.imageUrl;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GPT Image API error ${response.status}: ${text}`);
    }

    const data = await response.json() as any;
    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) throw new Error('GPT Image: no image URL in response');

    return imageUrl;
  },

  async queryResult(remoteTaskId: string, _options: AdapterOptions): Promise<string | null> {
    // Sync adapter: result URL returned directly
    if (remoteTaskId.startsWith('http')) return remoteTaskId;
    return null;
  },
};
