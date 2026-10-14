import type { ErrorType } from '@tut/types';
import type OpenAI from 'openai';

import type { ChatStreamPayload } from './chat';
import type { ITutAgentRuntimeErrorType } from './error';

export interface AgentInitErrorPayload {
  error: object;
  errorType: string | number;
}

export interface ChatCompletionErrorPayload {
  [key: string]: any;
  endpoint?: string;
  error: object;
  errorType: ErrorType | ITutAgentRuntimeErrorType;
  message?: string;
  provider: string;
}

export interface CreateImageErrorPayload {
  error: object;
  errorType: ITutAgentRuntimeErrorType;
  provider: string;
}

export interface CreateChatCompletionOptions {
  chatModel: OpenAI;
  payload: ChatStreamPayload;
}

// canonical definition lives next to the ModelProvider enum in model-bank
export type { ModelProviderKey } from 'model-bank';
