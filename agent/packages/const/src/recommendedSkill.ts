export enum RecommendedSkillType {
  Builtin = 'builtin',
  Composio = 'composio',
  Mcit = 'mcit',
}

export interface RecommendedSkillItem {
  id: string;
  type: RecommendedSkillType;
}

export const RECOMMENDED_SKILLS: RecommendedSkillItem[] = [
  // Builtin skills
  { id: 'tut-artifacts', type: RecommendedSkillType.Builtin },
  { id: 'tut-user-memory', type: RecommendedSkillType.Builtin },
  { id: 'tut-cloud-sandbox', type: RecommendedSkillType.Builtin },
  { id: 'tut-task', type: RecommendedSkillType.Builtin },
  { id: 'tut-agent-documents', type: RecommendedSkillType.Builtin },
  { id: 'tut-message', type: RecommendedSkillType.Builtin },
  // Opt-in chat image/video generation: default-installed so Tools can pin them without Skill Store first.
  { id: 'tut-image-generation', type: RecommendedSkillType.Builtin },
  { id: 'tut-video-generation', type: RecommendedSkillType.Builtin },
  // MCIT AI skills
  { id: 'notion', type: RecommendedSkillType.Mcit },
  { id: 'posthog', type: RecommendedSkillType.Mcit },
  { id: 'twitter', type: RecommendedSkillType.Mcit },
  // Composio skills
  { id: 'gmail', type: RecommendedSkillType.Composio },
  { id: 'google-drive', type: RecommendedSkillType.Composio },
  { id: 'google-calendar', type: RecommendedSkillType.Composio },
  { id: 'slack', type: RecommendedSkillType.Composio },
];
