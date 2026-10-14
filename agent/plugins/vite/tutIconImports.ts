import transformImports from '@rolldown/plugin-transform-imports';
import type { Plugin, PluginOption } from 'vite';

const NAMED_EXPORT_PREFIX = 'virtual:tut-icon-named:';
const RESOLVED_NAMED_EXPORT_PREFIX = `\0${NAMED_EXPORT_PREFIX}`;

const namedExportModules = {
  agentMappings: '@mcit-vendor/icons/es/features/agentConfig.js',
  modelMappings: '@mcit-vendor/icons/es/features/modelConfig.js',
  ModelProvider: '@mcit-vendor/icons/es/features/providerEnum.js',
  providerMappings: '@mcit-vendor/icons/es/features/providerConfig.js',
  toc: '@mcit-vendor/icons/es/toc.js',
  useFillId: '@mcit-vendor/icons/es/hooks/useFillId.js',
  useFillIds: '@mcit-vendor/icons/es/hooks/useFillId.js',
} as const;

type NamedExport = keyof typeof namedExportModules;

const isNamedExport = (value: string): value is NamedExport => value in namedExportModules;

const namedExportProxy = (): Plugin => ({
  name: 'tut-icon-named-export-proxy',
  load(id) {
    if (!id.startsWith(RESOLVED_NAMED_EXPORT_PREFIX)) return;

    const member = id.slice(RESOLVED_NAMED_EXPORT_PREFIX.length);
    if (!isNamedExport(member)) return;

    return `export { ${member} as default } from '${namedExportModules[member]}';`;
  },
  resolveId(id) {
    if (!id.startsWith(NAMED_EXPORT_PREFIX)) return;

    return `\0${id}`;
  },
});

const includeModuleExtensions = (plugin: ReturnType<typeof transformImports>) => {
  if (typeof plugin.transform !== 'object' || !plugin.transform) return plugin;

  plugin.transform = {
    ...plugin.transform,
    filter: {
      ...plugin.transform.filter,
      // @mcit-vendor/ui is published as .mjs and imports @mcit-vendor/icons internally.
      // The upstream plugin currently only includes .js/.jsx/.ts/.tsx by default.
      id: /\.[cm]?[jt]sx?$/,
    },
  };

  return plugin;
};

/**
 * Rewrites the @mcit-vendor/icons barrel to deep imports.
 *
 * The SPA entry and lazy routes otherwise share the same barrel module. Once a
 * lazy route uses ModelIcon or ProviderIcon, their complete mapping tables are
 * promoted into the initial shared chunk even when the first screen only needs
 * a small standalone icon.
 */
export const tutIconImports = (): PluginOption[] => {
  const iconImports = transformImports({
    '@mcit-vendor/icons': {
      preventFullImport: true,
      transform: [
        [
          'AgentIcon|IconAvatar|IconCombine|ModelIcon|ModelTag|ProviderCombine|ProviderIcon',
          '@mcit-vendor/icons/es/features/{{member}}/index.js',
        ],
        [
          'agentMappings|modelMappings|ModelProvider|providerMappings|toc|useFillId|useFillIds',
          `${NAMED_EXPORT_PREFIX}{{member}}`,
        ],
        ['*', '@mcit-vendor/icons/es/{{member}}/index.js'],
      ],
    },
  });

  return [namedExportProxy(), includeModuleExtensions(iconImports)];
};

export const __testing = {
  NAMED_EXPORT_PREFIX,
  RESOLVED_NAMED_EXPORT_PREFIX,
  namedExportModules,
};
