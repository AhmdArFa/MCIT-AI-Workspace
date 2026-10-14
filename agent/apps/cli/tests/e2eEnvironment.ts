import path from 'node:path';

/** Live tests must opt in to writes and select their own account home and server. */
export function validateE2EEnvironment(env: NodeJS.ProcessEnv) {
  if (env.MCIT_E2E_ALLOW_WRITES !== '1') {
    throw new Error('Live E2E writes real data. Set MCIT_E2E_ALLOW_WRITES=1 to opt in.');
  }

  const home = env.MCIT_CLI_HOME?.trim();
  if (!home || path.basename(path.normalize(home)) === '.mcit') {
    throw new Error('Set MCIT_CLI_HOME to a dedicated test account directory, not .mcit.');
  }

  if (!env.MCIT_SERVER) throw new Error('Set MCIT_SERVER explicitly for live E2E.');
  const server = new URL(env.MCIT_SERVER);
  if (!['http:', 'https:'].includes(server.protocol) || server.username || server.password) {
    throw new Error('MCIT_SERVER must be an HTTP(S) URL without credentials.');
  }
}
