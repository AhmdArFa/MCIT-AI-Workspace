'use client';

import type { BuiltinStreamingProps } from '@tut/types';
import { Block, Markdown } from '@mcit-vendor/ui';
import { memo } from 'react';

import type { UpdateAgentPromptParams } from '../../../types';

export const UpdateAgentPromptStreaming = memo<BuiltinStreamingProps<UpdateAgentPromptParams>>(
  ({ args }) => {
    const { prompt } = args || {};

    if (!prompt) return null;

    return (
      <Block paddingBlock={8} paddingInline={12} variant={'outlined'} width="100%">
        <Markdown animated variant={'chat'}>
          {prompt}
        </Markdown>
      </Block>
    );
  },
);

UpdateAgentPromptStreaming.displayName = 'UpdateAgentPromptStreaming';

export default UpdateAgentPromptStreaming;
