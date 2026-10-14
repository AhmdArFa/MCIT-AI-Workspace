import type { ToolManifest, ToolManifestType } from './manifest';
import type { CustomPluginParams } from './plugin';
import type { TutToolType } from './tool';

export interface TutTool {
  customParams?: CustomPluginParams | null;
  identifier: string;
  manifest?: ToolManifest | null;
  /**
   * use for runtime
   */
  runtimeType?: ToolManifestType;
  settings?: any;
  // TODO: remove type and then make it required
  source?: TutToolType;
  /**
   * need to be replaced with source
   * @deprecated
   */
  type: TutToolType;
}

export type TutToolRenderType = ToolManifestType;

export * from './builtin';
export * from './crawler';
export * from './error';
export * from './intervention';
export * from './manifest';
export * from './plugin';
export * from './search';
export * from './tool';
