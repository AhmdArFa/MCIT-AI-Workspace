import { AuvManifest } from '@tut/builtin-tool-auv';
import { groupSupervisorToolIds } from '@tut/builtin-tools';
import { describe, expect, it } from 'vitest';

import { filterAllowedBuiltinTools } from './deviceTools';
import { resolveToolRules } from './resolveToolRules';
import type { ToolRuleRequest } from './types';

const request = (overrides: Partial<ToolRuleRequest> = {}): ToolRuleRequest => ({
  agent: { chatConfig: {}, plugins: ['my-plugin'] },
  executionTarget: 'sandbox',
  localExecutionReady: false,
  model: { canUseFC: true },
  ...overrides,
});

describe('resolveToolRules', () => {
  it('derives the three modes from the chat config, never from the model', () => {
    expect(resolveToolRules(request()).toolMode).toBe('agent');
    expect(
      resolveToolRules(request({ agent: { chatConfig: { enableAgentMode: false }, plugins: [] } }))
        .toolMode,
    ).toBe('chat');
    expect(
      resolveToolRules(request({ agent: { chatConfig: { toolMode: 'custom' }, plugins: [] } }))
        .toolMode,
    ).toBe('custom');
    // A model without function calling keeps the stored mode; the tools
    // engine marks the tools incompatible instead.
    expect(resolveToolRules(request({ model: { canUseFC: false } })).toolMode).toBe('agent');
  });

  it('enables only the attachments tool when an oversized file is previewed', () => {
    expect(resolveToolRules(request()).rules['tut-attachments']).toBe(false);

    const { rules } = resolveToolRules(request({ hasOversizedFiles: true }));
    expect(rules['tut-attachments']).toBe(true);
    expect(rules['tut-knowledge-base']).toBe(false);

    const chatMode = resolveToolRules(
      request({ agent: { chatConfig: { enableAgentMode: false } }, hasOversizedFiles: true }),
    );
    expect(chatMode.rules['tut-attachments']).toBe(true);
  });

  it('chat mode is a strict whitelist with no activator and no always-on tools', () => {
    const resolved = resolveToolRules(
      request({
        agent: { chatConfig: { enableAgentMode: false }, plugins: ['my-plugin'] },
        hasEnabledKnowledgeBases: true,
      }),
    );
    expect(resolved.allowExplicitActivation).toBe(false);
    expect(resolved.rules['my-plugin']).toBeUndefined();
    expect(resolved.rules['tut-agent']).toBeUndefined();
    expect(resolved.rules['tut-knowledge-base']).toBe(true);
    expect(resolved.rules['tut-web-browsing']).toBe(true);
    expect(resolved.defaultToolIds).not.toContain('tut-agent');
  });

  it('custom mode is exactly the pinned plugins', () => {
    const resolved = resolveToolRules(
      request({ agent: { chatConfig: { toolMode: 'custom' }, plugins: ['a', 'b'] } }),
    );
    expect(resolved.rules).toEqual({ a: true, b: true });
    expect(resolved.defaultToolIds).toEqual(['a', 'b']);
    expect(resolved.allowExplicitActivation).toBe(false);
  });

  it('agent mode enables pinned, runtime and always-on tools and opens the activator', () => {
    const resolved = resolveToolRules(
      request({ isGroupSupervisor: true, runtimePluginIds: ['scope-plugin'] }),
    );
    expect(resolved.allowExplicitActivation).toBe(true);
    expect(resolved.rules['my-plugin']).toBe(true);
    expect(resolved.rules['scope-plugin']).toBe(true);
    expect(resolved.rules['tut-agent']).toBe(true);
    for (const id of groupSupervisorToolIds) {
      expect(resolved.rules[id]).toBe(true);
      expect(resolved.defaultToolIds).toContain(id);
    }
  });

  it('offers image generation only when pinned on a tool-calling model without native output', () => {
    const pinned = { chatConfig: { enableAgentMode: false }, plugins: ['tut-image-generation'] };
    expect(resolveToolRules(request({ agent: pinned })).rules['tut-image-generation']).toBe(true);
    expect(
      resolveToolRules(request({ agent: pinned, model: { canUseFC: true, hasImageOutput: true } }))
        .rules['tut-image-generation'],
    ).toBe(false);
    expect(
      resolveToolRules(request({ agent: pinned, model: { canUseFC: false } })).rules[
        'tut-image-generation'
      ],
    ).toBe(false);
  });

  it('gates the sandbox, local and device tools on the execution target', () => {
    const sandbox = resolveToolRules(request({ executionTarget: 'sandbox' }));
    expect(sandbox.rules['tut-cloud-sandbox']).toBe(true);
    expect(sandbox.rules['tut-local-system']).toBe(false);

    const auto = resolveToolRules(request({ executionTarget: 'auto' }));
    expect(auto.rules['tut-cloud-sandbox']).toBe(true);

    const localNotReady = resolveToolRules(request({ executionTarget: 'local' }));
    expect(localNotReady.rules['tut-local-system']).toBe(false);
    expect(localNotReady.rules['tut-browser']).toBe(false);

    const localReady = resolveToolRules(
      request({ executionTarget: 'local', localExecutionReady: true }),
    );
    expect(localReady.rules['tut-local-system']).toBe(true);
    expect(localReady.rules['tut-browser']).toBe(true);
    expect(localReady.rules['tut-cloud-sandbox']).toBe(false);

    const disabledLocal = resolveToolRules(
      request({ disableLocalSystem: true, executionTarget: 'local', localExecutionReady: true }),
    );
    expect(disabledLocal.rules['tut-local-system']).toBe(false);
  });

  it('offers the device picker only behind a gateway while a device decision remains', () => {
    // A persisted `device` target on a server without a gateway: the policy
    // allows a device, but nothing could dispatch to one.
    const noGateway = resolveToolRules(
      request({
        deviceAccess: { canUseDevice: true, deviceLocked: false },
        executionTarget: 'device',
      }),
    );
    expect(noGateway.rules['tut-remote-device']).toBe(false);
    expect(noGateway.excludedIdentifiers).toEqual(new Set());

    const open = resolveToolRules(
      request({
        device: { supportedTools: [AuvManifest.identifier] },
        deviceAccess: { canUseDevice: true, deviceLocked: false },
        executionTarget: 'device',
      }),
    );
    expect(open.rules['tut-remote-device']).toBe(true);

    const locked = resolveToolRules(
      request({
        device: { supportedTools: [AuvManifest.identifier] },
        deviceAccess: { canUseDevice: true, deviceLocked: true },
        executionTarget: 'device',
      }),
    );
    expect(locked.rules['tut-remote-device']).toBe(false);
    expect(locked.excludedIdentifiers.has('tut-remote-device')).toBe(true);
    expect(locked.excludedIdentifiers.has('tut-local-system')).toBe(false);
  });

  it('walls every device tool off for a run whose policy denies devices, gateway or not', () => {
    const denied = resolveToolRules(
      request({
        deviceAccess: { canUseDevice: false, deviceLocked: false },
        disabledPluginIds: ['my-plugin'],
        executionTarget: 'none',
      }),
    );
    expect(denied.excludedIdentifiers).toEqual(
      new Set([
        'my-plugin',
        'tut-local-system',
        'tut-remote-device',
        'tut-browser',
        AuvManifest.identifier,
      ]),
    );
    // Computer Use also disappears when the routed device does not support it.
    const unsupported = resolveToolRules(
      request({
        device: {},
        deviceAccess: { canUseDevice: true, deviceLocked: false },
        executionTarget: 'local',
      }),
    );
    expect(unsupported.excludedIdentifiers.has(AuvManifest.identifier)).toBe(true);
  });

  it('enables the message tool in bot conversations and search per the decision', () => {
    const bot = resolveToolRules(
      request({ isBotConversation: true, useApplicationBuiltinSearchTool: false }),
    );
    expect(bot.rules['tut-message']).toBe(true);
    expect(bot.rules['tut-web-browsing']).toBe(false);
    const off = resolveToolRules(request({ agent: { chatConfig: { searchMode: 'off' } } }));
    expect(off.rules['tut-web-browsing']).toBe(false);
  });
});

describe('filterAllowedBuiltinTools', () => {
  const tools = [
    { identifier: 'tut-local-system' },
    { identifier: 'tut-remote-device' },
    { identifier: AuvManifest.identifier },
    { identifier: 'tut-web-browsing' },
  ];
  it('keeps non-device tools and drops device tools per the walls', () => {
    const ids = (params: Parameters<typeof filterAllowedBuiltinTools>[1]) =>
      filterAllowedBuiltinTools(tools, params).map((t) => t.identifier);
    expect(ids({ canUseDevice: false, deviceLocked: false })).toEqual(['tut-web-browsing']);
    expect(ids({ canUseDevice: true, deviceLocked: true })).toEqual([
      'tut-local-system',
      AuvManifest.identifier,
      'tut-web-browsing',
    ]);
    expect(ids({ canUseDevice: true, deviceLocked: false, supportedDeviceTools: [] })).toEqual([
      'tut-local-system',
      'tut-remote-device',
      'tut-web-browsing',
    ]);
    expect(ids({ canUseDevice: true, deviceLocked: false, disableLocalSystem: true })).toEqual([
      'tut-remote-device',
      'tut-web-browsing',
    ]);
  });
});
