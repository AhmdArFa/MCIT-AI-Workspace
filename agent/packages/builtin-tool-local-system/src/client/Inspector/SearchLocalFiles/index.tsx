'use client';

import { createSearchLocalFilesInspector } from '@tut/shared-tool-ui/inspectors';

export const SearchLocalFilesInspector = createSearchLocalFilesInspector({
  noResultsKey: 'builtins.tut-local-system.inspector.noResults',
  translationKey: 'builtins.tut-local-system.apiName.searchLocalFiles',
});
