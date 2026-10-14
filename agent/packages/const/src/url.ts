import urlJoin from 'url-join';

export const OFFICIAL_URL = 'https://mcit.gov.eg';
export const OFFICIAL_SITE = 'https://mcit.gov.eg';
export const OFFICIAL_DOMAIN = 'mcit.gov.eg';

export const OFFICIAL_CLOUD_URL = OFFICIAL_SITE;

export const isOfficialCloudServer = (url?: string): boolean => {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return hostname === OFFICIAL_DOMAIN || hostname.endsWith(`.${OFFICIAL_DOMAIN}`);
  } catch {
    return false;
  }
};

export const OFFICIAL_DEVICE_GATEWAY_URL = 'http://localhost:8788';
export const OFFICIAL_AGENT_GATEWAY_URL = 'http://localhost:8787';

export const OG_URL = '/mcit-logo.webp';

export const McitPath = {
  webapi: {
    modelConfig: '/webapi/mcit-model-config',
  },
} as const;

export const GITHUB = 'https://github.com/AhmdArFa/MCIT-Agent';
export const GITHUB_ISSUES = urlJoin(GITHUB, 'issues');
export const CHANGELOG = '/changelog';

export const DOCUMENTS = 'https://mcit.gov.eg';
export const USAGE_DOCUMENTS = 'https://mcit.gov.eg';
export const SELF_HOSTING_DOCUMENTS = 'https://mcit.gov.eg';
export const DATABASE_SELF_HOSTING_URL = 'https://mcit.gov.eg';

export const DOCUMENTS_REFER_URL = DOCUMENTS;

export const WIKI_PLUGIN_GUIDE = 'https://mcit.gov.eg';
export const MANUAL_UPGRADE_URL = 'https://mcit.gov.eg';

export const BLOG = 'https://mcit.gov.eg';

export const ABOUT = 'https://mcit.gov.eg';
export const FEEDBACK = 'https://github.com/AhmdArFa/MCIT-Agent/issues';
export const PRIVACY_URL = '/privacy';
export const TERMS_URL = '/terms';

export const PLUGINS_INDEX_URL = '';
export const OPS_ASSETS_BASE_URL = '';

export const MORE_MODEL_PROVIDER_REQUEST_URL = 'https://mcit.gov.eg';
export const MORE_FILE_PREVIEW_REQUEST_URL = 'https://mcit.gov.eg';

export const AGENTS_INDEX_GITHUB = 'https://github.com/AhmdArFa/MCIT-Agent';
export const AGENTS_INDEX_GITHUB_ISSUE = urlJoin(AGENTS_INDEX_GITHUB, 'issues');
export const AGENTS_OFFICIAL_URL = '/';
export const WORKSPACE_OFFICIAL_URL = '/';

export const AGENT_CHAT_URL = (agentId: string, _mobile?: boolean) => `/agent/${agentId}`;
export const AGENT_CHAT_TOPIC_URL = (agentId: string, topicId: string, _mobile?: boolean) =>
  urlJoin('/agent', agentId, topicId);
export const AGENT_CHAT_TOPIC_PAGE_URL = (agentId: string, topicId: string, _mobile?: boolean) =>
  urlJoin('/agent', agentId, topicId, 'page');
export const AGENT_PROFILE_URL = (agentId: string) => `/agent/${agentId}/profile`;

export const GROUP_CHAT_URL = (groupId: string) => `/group/${groupId}`;
export const GROUP_CHAT_TOPIC_URL = (groupId: string, topicId: string) =>
  urlJoin('/group', groupId, topicId);

export const LIBRARY_URL = (id: string) => urlJoin('/resource/library', id);
export const imageUrl = (filename: string) => `/app-images/${filename}`;
export const TUT_URL_IMPORT_NAME = 'settings';

export const RELEASES_URL = urlJoin(GITHUB, 'releases');
export const mailTo = (email: string) => `mailto:${email}`;

export const AES_GCM_URL = 'https://datatracker.ietf.org/doc/html/draft-ietf-avt-srtp-aes-gcm-01';
export const BASE_PROVIDER_DOC_URL = 'https://mcit.gov.eg';
export const CHANGELOG_URL = '/changelog';

export const DOWNLOAD_URL = {
  android: '',
  default: '/',
  mobile: '/',
  ios: '',
} as const;

export const channelDocUrl = (_platform: string) => 'https://mcit.gov.eg';
export const discoverUrl = (_type: string, _identifier: string) => '/';
