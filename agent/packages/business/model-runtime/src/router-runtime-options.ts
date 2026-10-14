import type { RouterRuntimeRequestContext } from '@tut/types';

interface RouterInstance {
  apiType: string;
  models?: string[];
  options: {
    accessKeyId?: string;
    accessKeySecret?: string;
    apiKey?: string;
    apiVersion?: string;
    baseURL?: string;
    baseURLOrAccountID?: string;
    dangerouslyAllowBrowser?: boolean;
    region?: string;
    sessionToken?: string;
  };
}

interface McitRouterRuntimeOptions {
  id: string;
  routers: (options: any, runtimeContext: RouterRuntimeRequestContext) => Promise<RouterInstance[]>;
}

export const mcitRouterRuntimeOptions: McitRouterRuntimeOptions = {
  id: 'mcit',

  routers: async (_options, { model: _model }) => {
    return [];
  },
};
