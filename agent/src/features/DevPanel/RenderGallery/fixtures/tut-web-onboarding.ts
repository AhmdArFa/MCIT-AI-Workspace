'use client';

import { defineFixtures, single } from './_helpers';

export default defineFixtures({
  identifier: 'tut-web-onboarding',
  meta: {
    description: 'Web onboarding intervention previews.',
    title: 'Web Onboarding',
  },
  apiList: [
    {
      description: 'Save the agent identity collected during web onboarding.',
      name: 'saveUserQuestion',
    },
  ],
  fixtures: {
    saveUserQuestion: single({
      args: {
        agentEmoji: '🧪',
        agentName: 'Devtools Tester',
        fullName: 'Sam',
        interests: ['observability', 'dev-tools', 'agent-runtime'],
      },
    }),
  },
});
