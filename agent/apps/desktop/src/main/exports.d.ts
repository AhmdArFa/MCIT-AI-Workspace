import type { DesktopIpcServices } from './controllers/registry';

declare module '@tut/electron-client-ipc' {
   
  interface DesktopIpcServicesMap extends DesktopIpcServices {}
}

export { type DesktopIpcServices } from './controllers/registry';
