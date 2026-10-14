import type { Config } from './generated/client';
import { createClient, createConfig } from './generated/client';
import { Mcit } from './generated/sdk.gen';

export const DEFAULT_BASE_URL = 'https://mcit.gov.eg';

export interface McitOptions extends Omit<Config, 'auth' | 'baseUrl'> {
  /** MCIT AI API Key (`sk-lh-...`) or an OIDC JWT */
  apiKey: string;
  /** API origin, defaults to MCIT AI (`https://mcit.gov.eg`) */
  baseURL?: string;
}

/**
 * Create a resource-style MCIT AI API client: `mcit.agents.list()`,
 * `mcit.files.uploadBatch()`, `mcit.users.me()`, …
 *
 * Resources, methods, and schemas are generated from
 * `packages/openapi/openapi.yml` — run `bun generate` after the spec changes.
 */
export const createMcit = (options: McitOptions): Mcit => {
  const { apiKey, baseURL = DEFAULT_BASE_URL, ...clientConfig } = options;
  const config: Config = { ...clientConfig, auth: () => apiKey, baseUrl: baseURL };

  return new Mcit({ client: createClient(createConfig(config)) });
};

export type { Client, Config } from './generated/client';
export { Mcit } from './generated/sdk.gen';
export type * from './generated/types.gen';
