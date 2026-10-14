export { cutOutFlatBackground, type CutOutResult, type RgbaImage } from './cutOutFlatBackground';
export {
  type AttachedArtworkReferences,
  generateArtworkImage,
  type GenerateArtworkImageOptions,
} from './generateArtworkImage';
export {
  resolveArtworkReferenceImageUrl,
  resolveArtworkReferenceSource,
  type ResolvedArtworkReferenceSource,
} from './referenceImages';
export { selectAgentArtworkModel } from './selectModel';
export { cutOutFullBodyArtwork } from './transparentFullBody';
export {
  generateWorkspaceAvatarImage,
  type GenerateWorkspaceAvatarImageOptions,
} from './workspaceAvatar';
// Re-exported so downstream consumers can type their style parameters without
// taking a direct dependency on `@tut/prompts`.
export type { AgentArtworkKind, AgentArtworkStyle } from '@tut/prompts';
