import { AxiosError } from 'axios';
import type { AxiosAdapter } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from './api-error';
import { createApiClient } from './client';

function successfulAdapter() {
  return vi.fn<AxiosAdapter>((config) =>
    Promise.resolve({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }),
  );
}

describe('API client', () => {
  it('blocks a missing API URL before reaching the network adapter', async () => {
    const client = createApiClient(undefined);
    const adapter = successfulAdapter();
    client.defaults.adapter = adapter;

    await expect(client.get('/test-resource')).rejects.toMatchObject({
      kind: 'configuration',
    });
    expect(adapter).not.toHaveBeenCalled();
  });

  it('passes the configured base URL, timeout, and cancellation signal', async () => {
    const client = createApiClient('https://backend.example.test');
    const adapter = successfulAdapter();
    const controller = new AbortController();
    client.defaults.adapter = adapter;

    await client.get('/test-resource', { signal: controller.signal });
    expect(adapter).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'https://backend.example.test',
        timeout: 15_000,
        signal: controller.signal,
      }),
    );
  });

  it('does not dispatch an already cancelled request', async () => {
    const client = createApiClient('https://backend.example.test');
    const adapter = successfulAdapter();
    const controller = new AbortController();
    client.defaults.adapter = adapter;
    controller.abort();

    await expect(
      client.get('/test-resource', { signal: controller.signal }),
    ).rejects.toMatchObject({ kind: 'cancelled' });
    expect(adapter).not.toHaveBeenCalled();
  });

  it('normalizes HTTP errors without assuming a backend response envelope', async () => {
    const client = createApiClient('https://backend.example.test');
    client.defaults.adapter = (config) =>
      Promise.reject(
        new AxiosError(
          'Request failed',
          'ERR_BAD_RESPONSE',
          config,
          undefined,
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {},
            data: 'unstructured response',
            config,
          },
        ),
      );

    await expect(client.get('/test-resource')).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'http',
      status: 503,
    });
  });

  it('normalizes transport failures into the shared error type', async () => {
    const client = createApiClient('https://backend.example.test');
    client.defaults.adapter = () =>
      Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK'));
    const request = client.get('/test-resource');
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({ kind: 'network' });
  });
});
