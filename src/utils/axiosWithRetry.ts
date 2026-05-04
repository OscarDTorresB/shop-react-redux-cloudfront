import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30_000;

interface RetryConfig extends AxiosRequestConfig {
  _retryCount?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createAxiosWithRetry(): AxiosInstance {
  const instance = axios.create();

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config as RetryConfig | undefined;

      if (!config) return Promise.reject(error);

      config._retryCount = config._retryCount ?? 0;

      const status: number | undefined = error.response?.status;
      const isRetryable = !status || RETRYABLE_STATUS_CODES.has(status);

      if (!isRetryable || config._retryCount >= MAX_RETRIES) {
        return Promise.reject(error);
      }

      config._retryCount++;

      // Exponential backoff with 30% jitter to avoid thundering herd
      const base = Math.min(
        BASE_DELAY_MS * 2 ** (config._retryCount - 1),
        MAX_DELAY_MS
      );
      const jitter = Math.random() * 0.3 * base;
      await sleep(base + jitter);

      return instance(config);
    }
  );

  return instance;
}

export default createAxiosWithRetry();
