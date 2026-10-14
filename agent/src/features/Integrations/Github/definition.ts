import { Github } from '@mcit-vendor/icons';

import { type IntegrationDefinition, registerIntegration } from '../registry';

export const GITHUB_INTEGRATION: IntegrationDefinition = {
  docsUrl: 'https://mcit.gov.eg/docs/usage/integrations/github',
  icon: Github,
  id: 'github',
  name: 'GitHub',
};

registerIntegration(GITHUB_INTEGRATION);
