'use client';

import { createSearchLocalFilesInspector } from '@tut/shared-tool-ui/inspectors';

export const SearchLocalFilesInspector = createSearchLocalFilesInspector({
  noResultsKey: 'builtins.tut-cloud-sandbox.inspector.noResults',
  translationKey: 'builtins.tut-cloud-sandbox.apiName.searchLocalFiles',
});
