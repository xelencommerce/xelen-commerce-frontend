import axios from 'axios';
import { env } from '@/config/env';
import { ApiError, toApiError } from './api-error';

export function createApiClient(baseURL: string | undefined) {
  const client = axios.create({
    timeout: 15_000,
    ...(baseURL ? { baseURL } : {}),
  });

  client.interceptors.request.use((config) => {
    if (!baseURL) {
      throw new ApiError(
        'Configure VITE_API_BASE_URL before making API requests.',
        'configuration',
      );
    }
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(toApiError(error)),
  );

  return client;
}

export const apiClient = createApiClient(env.apiBaseUrl);
