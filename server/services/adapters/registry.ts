import type { GenerationAdapter } from './base.adapter.js';
import { nanobananaAdapter } from './nanobanana.adapter.js';
import { jimengAdapter } from './jimeng.adapter.js';

class AdapterRegistry {
  private adapters = new Map<string, GenerationAdapter>();

  constructor() {
    this.register(nanobananaAdapter);
    this.register(jimengAdapter);
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
