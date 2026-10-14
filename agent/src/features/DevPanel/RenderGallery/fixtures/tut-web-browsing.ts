'use client';

import { defineFixtures, single, variants } from './_helpers';

export default defineFixtures({
  identifier: 'tut-web-browsing',
  fixtures: {
    crawlMultiPages: single({
      args: {
        urls: ['https://mcit.gov.eg', 'https://docs.mcit.gov.eg'],
      },
      pluginState: {
        results: [
          {
            crawler: 'firecrawl',
            data: {
              content: 'MCIT AI ships desktop and web experiences for AI collaboration.',
              description: 'Product homepage',
              title: 'MCIT AI',
              url: 'https://mcit.gov.eg',
            },
            originalUrl: 'https://mcit.gov.eg',
          },
          {
            crawler: 'firecrawl',
            data: {
              content: 'Developer documentation for routing, tooling, and local testing.',
              description: 'Docs homepage',
              title: 'MCIT AI Docs',
              url: 'https://docs.mcit.gov.eg',
            },
            originalUrl: 'https://docs.mcit.gov.eg',
          },
        ],
      },
    }),
    crawlSinglePage: single({
      args: { url: 'https://mcit.gov.eg/blog' },
      pluginState: {
        results: [
          {
            crawler: 'firecrawl',
            data: {
              content: 'Recent product updates and engineering notes.',
              description: 'Blog landing page',
              title: 'MCIT AI Blog',
              url: 'https://mcit.gov.eg/blog',
            },
            originalUrl: 'https://mcit.gov.eg/blog',
          },
        ],
      },
    }),
    search: variants([
      {
        args: {
          query: 'MCIT AI devtools preview route',
          searchEngines: ['google', 'bing'],
        },
        label: 'With results',
        pluginState: {
          query: 'MCIT AI devtools preview route',
          results: [
            {
              content: 'Documentation and implementation notes about local preview tooling.',
              engines: ['google'],
              title: 'Preview tooling guide',
              url: 'https://docs.example.com/preview-tooling',
            },
            {
              content: 'Issue thread describing the /devtools route rollout.',
              engines: ['bing'],
              title: 'Builtin render devtools issue',
              url: 'https://linear.example.com/issue/',
            },
          ],
        },
      },
      {
        args: {
          query: 'undocumented internal preview snapshot harness',
          searchEngines: ['google'],
        },
        label: 'No results',
        pluginState: {
          query: 'undocumented internal preview snapshot harness',
          results: [],
        },
      },
    ]),
  },
});
