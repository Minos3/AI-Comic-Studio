import type { GenerationAdapter } from './base.adapter.js';
import { nanobananaAdapter } from './nanobanana.adapter.js';
import { jimengAdapter } from './jimeng.adapter.js';
import { seedanceAdapter } from './seedance.adapter.js';
import { geminiImageAdapter } from './gemini-image.adapter.js';
import { gptImageAdapter } from './gpt-image.adapter.js';
import { soraAdapter } from './sora.adapter.js';
import { grokVideoAdapter } from './grok-video.adapter.js';
import { grokImageAdapter } from './grok-image.adapter.js';

class AdapterRegistry {
  private adapters = new Map<string, GenerationAdapter>();

  constructor() {
    this.register(nanobananaAdapter);
    this.register(jimengAdapter);
    this.register(seedanceAdapter);
    this.register(geminiImageAdapter);
    this.register(gptImageAdapter);
    this.register(soraAdapter);
    this.register(grokVideoAdapter);
    this.register(grokImageAdapter);
  }

  register(adapter: GenerationAdapter) {
    this.adapters.set(adapter.provider, adapter);
  }

  get(provider: string): GenerationAdapter | undefined {
    return this.adapters.get(provider);
  }

  list(): string[] {
    return Array.from(this.adapters.keys());
  }
}

export const adapterRegistry = new AdapterRegistry();
