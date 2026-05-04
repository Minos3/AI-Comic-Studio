import type { GenerationAdapter, AdapterOptions } from './base.adapter.js';

// Nanobanana2 → Gemini Image (generateContent, non-streaming)
export const geminiImageAdapter: GenerationAdapter = {
  provider: 'gemini-image',

  async submitTask(prompt: string, options: AdapterOptions): Promise<string> {
    const baseUrl = options.apiUrl || 'https://aigc.x-see.cn';
    const url = `${baseUrl}/v1beta/models/gemini-3.1-flash-image-preview:generateContent`;

    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: options.configJson?.aspectRatio || '16:9',
          imageSize: options.configJson?.imageSize || '1K',
        },
      },
    };

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
      throw new Error(`Gemini Image API error ${response.status}: ${text}`);
    }

    const data = await response.json() as any;

    // Extract inline image data
    const parts = data.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const ext = mimeType.includes('jpeg') ? 'jpg' : 'png';
          // Return as a data URL — task service will download and store it
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error('Gemini Image: no image data in response');
  },

  async queryResult(remoteTaskId: string, _options: AdapterOptions): Promise<string | null> {
    // Sync adapter: result is already returned as data URL from submitTask
    if (remoteTaskId.startsWith('data:')) return remoteTaskId;
    return null;
  },
};
