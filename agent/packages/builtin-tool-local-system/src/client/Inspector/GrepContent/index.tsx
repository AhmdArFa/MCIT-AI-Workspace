'use client';

import { createGrepContentInspector } from '@tut/shared-tool-ui/inspectors';

export const GrepContentInspector = createGrepContentInspector({
  noResultsKey: 'builtins.tut-local-system.inspector.noResults',
  translationKey: 'builtins.tut-local-system.apiName.grepContent',
});
