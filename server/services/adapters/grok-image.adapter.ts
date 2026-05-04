import type { GenerationAdapter, AdapterOptions } from './base.adapter.js';

// Grok Image — /v1/images/edits (multipart/form-data, image-to-image edit)
export const grokImageAdapter: GenerationAdapter = {
  provider: 'grok-image',

  async submitTask(prompt: string, options: AdapterOptions): Promise<string> {
    const baseUrl = options.apiUrl || 'https://aigc.x-see.cn';
    const url = `${baseUrl}/v1/images/edits`;

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('model', (options.configJson?.model as string) || 'grok-4-image');

    // If an image URL is provided (from reference), download and attach as blob
    if (options.imageUrl) {
      try {
        const imageResponse = await fetch(options.imageUrl, { signal: AbortSignal.timeout(30000) });
        if (imageResponse.ok) {
          const blob = await imageResponse.blob();
          formData.append('image', blob, 'reference.png');
        }
      } catch {
        // If image fetch fails, proceed without reference image (text-to-image)
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: formData,
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Grok Image API error ${response.status}: ${text}`);
    }

    const data = await response.json() as any;

    // Response may contain image URL or base64 data
    const imageUrl = data.url || data.data?.[0]?.url || data.image_url;
    if (imageUrl) return imageUrl;

    // Some APIs return the edited image directly as binary
    const contentType = response.headers.get('content-type');
    if (contentType?.startsWith('image/')) {
      const buffer = Buffer.from(await response.arrayBuffer());
      const ext = contentType.includes('png') ? 'png' : 'jpg';
      return `data:${contentType};base64,${buffer.toString('base64')}`;
    }

    if (Object.keys(data).length === 0) {
      throw new Error('Grok Image: empty response, model may not support text-to-image without reference');
    }

    throw new Error(`Grok Image: unexpected response: ${JSON.stringify(data).substring(0, 200)}`);
  },

  async queryResult(remoteTaskId: string, _options: AdapterOptions): Promise<string | null> {
    // Sync adapter: result URL or data URL returned directly
    if (remoteTaskId.startsWith('http') || remoteTaskId.startsWith('data:')) return remoteTaskId;
    return null;
  },
};
