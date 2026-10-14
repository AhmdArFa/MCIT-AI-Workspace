import { type TopicExportMode } from '@tut/types';

export interface BaseExportOptions {
  includeTool: boolean;
  withSystemRole: boolean;
}

export interface FieldType extends BaseExportOptions {
  exportMode: TopicExportMode;
}
