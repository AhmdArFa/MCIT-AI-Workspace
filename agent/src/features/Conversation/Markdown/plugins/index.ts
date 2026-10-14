import FileLink from './FileLink';
import GoalTurn from './GoalTurn';
import ImageSearchRef from './ImageSearchRef';
import Link from './Link';
import TutAgents from './TutAgents';
import TutArtifact from './TutArtifact';
import TutThinking from './TutThinking';
import LocalFile from './LocalFile';
import LocalFileLink from './LocalFileLink';
import Mention from './Mention';
import ReferTopic from './ReferTopic';
import ScmEvent from './ScmEvent';
import Skill from './Skill';
import Task from './Task';
import Thinking from './Thinking';
import Tool from './Tool';
import { type MarkdownElement } from './type';
import UserFeedback from './UserFeedback';

export type { MarkdownElement } from './type';

export const markdownElements: MarkdownElement[] = [
  Thinking,
  TutArtifact,
  TutThinking,
  LocalFile,
  Mention,
  ReferTopic,
  Skill,
  Tool,
  Task,
  ScmEvent,
  GoalTurn,
  UserFeedback,
  ImageSearchRef,
  TutAgents,
  LocalFileLink,
  FileLink,
  Link,
];
