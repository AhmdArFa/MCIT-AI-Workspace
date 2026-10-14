export type TTSServer = 'openai';

export interface TutAgentTTSConfig {
  showAllLocaleVoice?: boolean;
  ttsService: TTSServer;
  voice: {
    openai: string;
  };
}
