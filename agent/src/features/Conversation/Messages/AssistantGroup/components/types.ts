import type { AssistantGroupSemanticBlock } from '@tut/conversation-flow';

export interface RenderableAssistantContentBlock extends AssistantGroupSemanticBlock {
  contentOverride?: string;
  disableMarkdownStreaming?: boolean;
  domId?: string;
  hasToolsOverride?: boolean;
  renderKey?: string;
}
