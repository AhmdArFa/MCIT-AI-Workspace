'use client';

import { createGrepContentInspector } from '@tut/shared-tool-ui/inspectors';

export const GrepContentInspector = createGrepContentInspector({
  noResultsKey: 'builtins.tut-cloud-sandbox.inspector.noResults',
  translationKey: 'builtins.tut-cloud-sandbox.apiName.grepContent',
});
