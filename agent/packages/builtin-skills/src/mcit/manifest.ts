import type { BuiltinSkillManifest } from '@tut/types';

export const McitIdentifier = 'mcit';

const MCIT_AVATAR = '/avatars/mcit/tutankhamun.webp';

export const McitManifest: BuiltinSkillManifest = {
  avatar: MCIT_AVATAR,
  description:
    "Read and change TuT AI platform data through the CLI, including this agent's own configuration. ACTIVATE when the user wants to: (1) change this agent — system prompt / persona, tools / plugins / skills, model or provider, knowledge bases or files, opening message, or topic title; (2) work with any platform resource — agents, topics, messages, memory, documents, knowledge bases, files, search, content generation, models / providers / plugins, evals, usage stats; (3) connect a chat-platform bot — Discord, Telegram, Slack, Feishu, Lark, QQ, WeChat; (4) read another conversation — the message contains a topic id (`tpc_…`) or a `<refer_topic>` tag.",
  identifier: McitIdentifier,
  name: 'TuT AI',
  source: 'builtin',
};
