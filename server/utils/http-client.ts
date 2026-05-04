import axios, { type AxiosInstance } from 'axios';

function createHttpClient(): AxiosInstance {
  const proxy = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

  const client = axios.create({
    timeout: 30000,
    ...(proxy ? {
      proxy: false,
      httpAgent: undefined,
      httpsAgent: undefined,
    } : {}),
  });

  // If proxy is set, use env-based proxy (axios respects HTTP_PROXY/HTTPS_PROXY env vars by default)
  if (proxy) {
    const url = new URL(proxy);
    client.defaults.proxy = {
      host: url.hostname,
      port: parseInt(url.port, 10),
      protocol: url.protocol.replace(':', ''),
    };
  }

  return client;
}

export const httpClient = createHttpClient();
