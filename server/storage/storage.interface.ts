export interface StorageInterface {
  save(filePath: string, data: Buffer): Promise<string>;
  get(filePath: string): Promise<Buffer>;
  delete(filePath: string): Promise<void>;
  exists(filePath: string): Promise<boolean>;
}
