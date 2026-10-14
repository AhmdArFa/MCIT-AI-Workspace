/**
 * @vitest-environment happy-dom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { McitSkillStatus } from '@/store/tool/slices/mcitSkillStore/types';

import SkillDetail from './index';

const mocks = vi.hoisted(() => {
  const toolState = {
    agentSkillListMap: {} as Record<
      string,
      Array<{ id: string; identifier: string; userId?: string }>
    >,
    builtinSkills: [],
    checkMcitSkillStatus: vi.fn(),
    composioServers: [] as Array<{ identifier: string; status: string }>,
    connectors: [] as Array<{ id: string; identifier: string }>,
    createComposioConnection: vi.fn(),
    deleteAgentSkill: vi.fn(),
    fetchConnectors: vi.fn(),
    getMcitSkillAuthorizeUrl: vi.fn(),
    installBuiltinTool: vi.fn(),
    installedBuiltinIds: [] as string[],
    installedPlugins: [] as Array<{
      customParams?: { mcp?: Record<string, unknown> };
      identifier: string;
      type: string;
    }>,
    mcitSkillServers: [] as Array<{
      identifier: string;
      isConnected: boolean;
      name: string;
      status: string;
      tools?: Array<{
        description?: string;
        inputSchema: Record<string, unknown>;
        name: string;
      }>;
    }>,
    refreshComposioConnectionStatus: vi.fn(),
    removeComposioConnection: vi.fn(),
    revokeMcitSkill: vi.fn(),
    syncBuiltinTool: vi.fn(),
    syncPluginTools: vi.fn(),
    syncToolsFromClient: vi.fn(),
    uninstallBuiltinTool: vi.fn(),
  };

  function selectToolStore<T>(selector: (state: typeof toolState) => T): T {
    return selector(toolState);
  }

  const useToolStoreWithState = Object.assign(vi.fn(selectToolStore), {
    getState: vi.fn(() => toolState),
  });

  return {
    confirmModal: vi.fn(),
    permissions: {
      create_content: true,
      edit_own_content: true,
    },
    toolState,
    useToolStore: useToolStoreWithState,
    userState: { userId: 'user-id' },
  };
});

vi.mock('@tut/const', () => ({
  COMPOSIO_APP_TYPES: [],
  isDesktop: false,
  getMcitSkillProviderById: (identifier: string) =>
    identifier === 'notion'
      ? {
          label: 'Notion',
        }
      : undefined,
}));

vi.mock('@mcit-vendor/ui/base-ui', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  confirmModal: mocks.confirmModal,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string; name?: string } | string) => {
      const translations: Record<string, string> = {
        'tools.mcitSkill.connect': 'Connect',
        'tools.mcitSkill.disconnect': 'Disconnect',
        'tools.mcitSkill.disconnectConfirm.desc': `Disconnect ${(options as { name?: string })?.name}?`,
        'tools.mcitSkill.disconnectConfirm.title': `Disconnect ${(options as { name?: string })?.name}`,
        'tools.legacyConnector.configure': 'Configure',
        'tools.legacyConnector.upgradeDesc':
          'This connector still uses the legacy plugin format. Configure it to finish upgrading, then manage its tool permissions here.',
        'tools.noConfigurablePermissions':
          'This skill does not expose configurable tool permissions.',
      };

      if (translations[key]) return translations[key];
      if (typeof options === 'object' && options?.defaultValue) return options.defaultValue;

      return key;
    },
  }),
}));

vi.mock('@/features/AgentSkillDetail', () => ({
  default: () => <div data-testid="agent-skill-detail" />,
}));

vi.mock('@/features/Connectors', () => ({
  ConnectorDetail: ({
    connectorId,
    lifecycleActions,
  }: {
    connectorId: string;
    lifecycleActions?: ReactNode;
  }) => (
    <div data-testid="connector-detail">
      <span>{connectorId}</span>
      {lifecycleActions}
    </div>
  ),
  CustomConnectorModal: ({ open }: { open?: boolean }) =>
    open ? <div data-testid="migration-modal" /> : null,
}));

vi.mock('@/hooks/usePermission', () => ({
  usePermission: (action: 'create_content' | 'edit_own_content') => ({
    allowed: mocks.permissions[action],
    reason: '',
  }),
}));

vi.mock('@/store/tool', () => ({
  useToolStore: mocks.useToolStore,
}));

vi.mock('@/store/tool/selectors', () => ({
  agentSkillsSelectors: {
    getAgentSkills: (state: typeof mocks.toolState) => state.agentSkillListMap.all || [],
  },
  builtinToolSelectors: {
    isBuiltinToolInstalled:
      (identifier: string) =>
      (state: typeof mocks.toolState): boolean =>
        state.installedBuiltinIds.includes(identifier),
  },
  composioStoreSelectors: {
    getServerByIdentifier:
      (identifier: string) =>
      (
        state: typeof mocks.toolState,
      ): (typeof mocks.toolState.composioServers)[number] | undefined =>
        state.composioServers.find((server) => server.identifier === identifier),
  },
  mcitSkillStoreSelectors: {
    getServerByIdentifier:
      (identifier: string) =>
      (
        state: typeof mocks.toolState,
      ): (typeof mocks.toolState.mcitSkillServers)[number] | undefined =>
        state.mcitSkillServers.find((server) => server.identifier === identifier),
  },
}));

vi.mock('@/store/tool/slices/connector', () => ({
  connectorSelectors: {
    connectorByIdentifier:
      (identifier: string) =>
      (state: typeof mocks.toolState): (typeof mocks.toolState.connectors)[number] | undefined =>
        state.connectors.find((connector) => connector.identifier === identifier),
  },
}));

// Mock the real selector to avoid pulling its `toolAvailability` → `skillFilters`
// → `@tut/const` (isDesktop) transitive imports into the unit env; mirror
// the real `getCustomPluginById` behaviour against the mocked tool state.
vi.mock('@/store/tool/slices/plugin/selectors', () => ({
  pluginSelectors: {
    getCustomPluginById:
      (identifier: string) =>
      (
        state: typeof mocks.toolState,
      ): (typeof mocks.toolState.installedPlugins)[number] | undefined =>
        state.installedPlugins.find(
          (plugin) => plugin.identifier === identifier && plugin.type === 'customPlugin',
        ),
  },
}));

vi.mock('@/store/user', () => ({
  useUserStore<T>(selector: (state: typeof mocks.userState) => T): T {
    return selector(mocks.userState);
  },
}));

vi.mock('@/store/user/selectors', () => ({
  userProfileSelectors: {
    userId: (state: typeof mocks.userState) => state.userId,
  },
}));

const connectedNotionServer = () => ({
  identifier: 'notion',
  isConnected: true,
  name: 'Notion',
  status: McitSkillStatus.CONNECTED,
});

describe('SkillDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.permissions.create_content = true;
    mocks.permissions.edit_own_content = true;
    mocks.toolState.composioServers = [];
    mocks.toolState.connectors = [];
    mocks.toolState.installedBuiltinIds = [];
    mocks.toolState.installedPlugins = [];
    mocks.toolState.mcitSkillServers = [];
  });

  it('offers a Configure migration action for an un-migrated legacy custom MCP', async () => {
    // Legacy `user_installed_plugins` custom MCP with an mcp config but no
    // matching `user_connectors` row → the panel should surface the migration
    // entry instead of the dead-end "no configurable permissions" copy.
    mocks.toolState.installedPlugins = [
      {
        customParams: { mcp: { type: 'http', url: 'https://mcp.example.com' } },
        identifier: 'my-mcp',
        type: 'customPlugin',
      },
    ];

    render(<SkillDetail identifier="my-mcp" type="mcp-connector" />);

    expect(await screen.findByRole('button', { name: 'Configure' })).toBeEnabled();
    expect(
      screen.getByText(
        'This connector still uses the legacy plugin format. Configure it to finish upgrading, then manage its tool permissions here.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('This skill does not expose configurable tool permissions.'),
    ).not.toBeInTheDocument();
  });

  it('shows a disconnect action for a connected MCIT AI connector without configurable tools', async () => {
    mocks.toolState.mcitSkillServers = [connectedNotionServer()];

    render(<SkillDetail identifier="notion" type="mcit-connector" />);

    expect(
      await screen.findByText('This skill does not expose configurable tool permissions.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Notion')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeEnabled();
    expect(mocks.toolState.syncToolsFromClient).not.toHaveBeenCalled();
  });

  it('syncs MCIT AI tools and passes the disconnect action into connector permissions detail', async () => {
    mocks.toolState.connectors = [{ id: 'connector-1', identifier: 'notion' }];
    mocks.toolState.mcitSkillServers = [
      {
        ...connectedNotionServer(),
        tools: [
          {
            description: 'Search pages',
            inputSchema: { type: 'object' },
            name: 'search',
          },
        ],
      },
    ];

    render(<SkillDetail identifier="notion" type="mcit-connector" />);

    expect(await screen.findByTestId('connector-detail')).toHaveTextContent('connector-1');
    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.toolState.syncToolsFromClient).toHaveBeenCalledWith({
        identifier: 'notion',
        name: 'Notion',
        sourceType: 'marketplace',
        tools: [
          {
            description: 'Search pages',
            inputSchema: { type: 'object' },
            toolName: 'search',
          },
        ],
      }),
    );
  });

  it('only leaves connector permissions detail after disconnect actually succeeds', async () => {
    const user = userEvent.setup();
    mocks.toolState.connectors = [{ id: 'connector-1', identifier: 'notion' }];
    mocks.toolState.mcitSkillServers = [
      {
        ...connectedNotionServer(),
        tools: [
          {
            inputSchema: { type: 'object' },
            name: 'search',
          },
        ],
      },
    ];
    mocks.confirmModal.mockImplementation(({ onOk }: { onOk?: () => Promise<void> }) => {
      void onOk?.();
    });
    mocks.toolState.revokeMcitSkill.mockResolvedValue(undefined);

    render(<SkillDetail identifier="notion" type="mcit-connector" />);

    await user.click(await screen.findByRole('button', { name: 'Disconnect' }));

    expect(mocks.confirmModal).toHaveBeenCalled();
    expect(await screen.findByTestId('connector-detail')).toBeInTheDocument();
    expect(
      screen.queryByText('This skill does not expose configurable tool permissions.'),
    ).not.toBeInTheDocument();
  });

  it('returns to the no-permissions state after a successful disconnect', async () => {
    const user = userEvent.setup();
    const server = {
      ...connectedNotionServer(),
      tools: [
        {
          inputSchema: { type: 'object' },
          name: 'search',
        },
      ],
    };
    mocks.toolState.connectors = [{ id: 'connector-1', identifier: 'notion' }];
    mocks.toolState.mcitSkillServers = [server];
    mocks.confirmModal.mockImplementation(({ onOk }: { onOk?: () => Promise<void> }) => {
      void onOk?.();
    });
    mocks.toolState.revokeMcitSkill.mockImplementation(async () => {
      server.isConnected = false;
      server.status = McitSkillStatus.NOT_CONNECTED;
    });

    render(<SkillDetail identifier="notion" type="mcit-connector" />);

    await user.click(await screen.findByRole('button', { name: 'Disconnect' }));

    await waitFor(() =>
      expect(
        screen.getByText('This skill does not expose configurable tool permissions.'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
  });
});
