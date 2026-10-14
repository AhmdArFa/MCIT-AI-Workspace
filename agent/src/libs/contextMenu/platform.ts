export type TutEnv = NonNullable<Window['tutEnv']>;

export const getTutEnv = (): TutEnv | undefined => window.tutEnv;

export const isDarwinDesktop = (): boolean => getTutEnv()?.platform === 'darwin';
