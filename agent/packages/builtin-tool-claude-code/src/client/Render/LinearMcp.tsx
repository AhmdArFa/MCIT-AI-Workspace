'use client';

import { LinearRender } from '@tut/shared-tool-ui/renders';
import type { BuiltinRender } from '@tut/types';

import {
  isLinearMcpApiName,
  LINEAR_MCP_PREFIX,
  LINEAR_MCP_TOOL_NAMES,
} from '../Inspector/linearMcpLabels';

const SharedLinearRender = LinearRender as unknown as BuiltinRender;

const FixedLinearMcpRenders: Record<string, BuiltinRender> = Object.fromEntries(
  LINEAR_MCP_TOOL_NAMES.map((tool) => [`${LINEAR_MCP_PREFIX}${tool}`, SharedLinearRender]),
);

export const LinearMcpRenders: Record<string, BuiltinRender> = new Proxy(FixedLinearMcpRenders, {
  get: (target, prop) => {
    if (typeof prop !== 'string') return undefined;
    return target[prop] || (isLinearMcpApiName(prop) ? SharedLinearRender : undefined);
  },
});
