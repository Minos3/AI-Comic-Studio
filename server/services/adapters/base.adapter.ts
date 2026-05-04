export interface AdapterOptions {
  apiUrl: string;
  apiKey: string;
  configJson?: Record<string, unknown>;
  /** Image URL to use as input for video generation */
  imageUrl?: string;
  /** Video duration in seconds */
  duration?: number;
}

export interface GenerationAdapter {
  readonly provider: string;
  submitTask(prompt: string, options: AdapterOptions): Promise<string>; // returns remote task ID
  queryResult(remoteTaskId: string, options: AdapterOptions): Promise<string | null>; // returns result URL or null
}
