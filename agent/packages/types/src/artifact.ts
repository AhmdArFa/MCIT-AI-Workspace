export interface PortalArtifact {
  children?: string;
  id: string;
  identifier?: string;
  language?: string;
  title?: string;
  type?: string;
}

export enum ArtifactType {
  Code = 'application/tut.artifacts.code',
  Default = 'html',
  Python = 'python',
  React = 'application/tut.artifacts.react',
}

export interface SharedArtifactData {
  id: string;
  iframeSrc: string;
  title: string | null;
}
