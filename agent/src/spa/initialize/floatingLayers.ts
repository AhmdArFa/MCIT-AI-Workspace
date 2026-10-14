import { TITLE_BAR_HEIGHT } from '@tut/desktop-bridge';
import { setFloatingCollisionPadding } from '@mcit-vendor/ui/base-ui';

export const reserveTitleBarForFloatingLayers = () => {
  setFloatingCollisionPadding({ top: TITLE_BAR_HEIGHT });
};
