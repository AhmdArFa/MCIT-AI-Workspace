import { CLASSNAMES } from '@mcit-vendor/ui';
import type { Theme } from 'antd-style';
import { css } from 'antd-style';

import {
  MAC_PANEL_BG_VAR,
  MAC_WINDOW_FULLSCREEN_SELECTOR,
} from '@/features/Electron/system/macWindowFullscreen';

// fix ios input keyboard
// overflow: hidden;
// ref: https://zhuanlan.zhihu.com/p/113855026
const genGlobalStyle = ({ token }: { prefixCls: string; token: Theme }) => css`
  html,
  body,
  #__next {
    position: relative;

    overscroll-behavior: none;

    height: 100%;
    min-height: 100dvh;
    max-height: 100dvh;

    @media (device-width >= 576px) {
      overflow: hidden;

      /* The root cannot scroll here, and a root 'none' also suppresses the
         elastic overscroll of inner scrollers in Chromium on macOS. */
      overscroll-behavior: auto;
    }
  }

  body {
    /* Own stacking context, otherwise render black edges will appear. Must NOT
       be a transform-based hack: a transform on body rebases every position:
       fixed descendant onto body, and a drawer panel mid slide-in then overflows
       body horizontally — focusing it scrolls the whole page sideways. */
    will-change: opacity;
    isolation: isolate;
  }

  * {
    scrollbar-color: rgba(255, 255, 255, 0.2) #0b0d12;
    scrollbar-width: thin;

    ::-webkit-scrollbar {
      width: 0.75em;
      height: 0.75em;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: rgba(255, 255, 255, 0.2);
    }

    :hover::-webkit-scrollbar-thumb {
      border: 3px solid transparent;
      background-color: #F5C242;
      background-clip: content-box;
    }

    ::-webkit-scrollbar-track {
      background-color: #0b0d12;
    }
  }

  /* antd resets re-apply antialiased on each component root, so body alone is not enough */
  html[data-font-antialiasing='off'] * {
    -webkit-font-smoothing: auto;
    -moz-osx-font-smoothing: auto;
  }

  html[data-theme='dark'] body,
  html.desktop[data-theme='dark'] body {
    background-color: #0b0d12;
  }

  html[data-theme='light'] body,
  html.desktop[data-theme='light'] body {
    background-color: #ffffff;
  }

  ${MAC_WINDOW_FULLSCREEN_SELECTOR} {
    ${MAC_PANEL_BG_VAR}: ${token.colorBgLayout};
  }

  ${MAC_WINDOW_FULLSCREEN_SELECTOR} body {
    background-color: ${token.colorBgLayout};
  }

  button {
    -webkit-app-region: no-drag;
  }

  .${CLASSNAMES.ContextTrigger}[data-popup-open]:not([data-no-highlight]),
  .${CLASSNAMES.DropdownMenuTrigger}[data-popup-open]:not([data-no-highlight]) {
    background: ${token.colorFillTertiary};
  }
  .accordion-action:has(
    .${CLASSNAMES.DropdownMenuTrigger}[data-popup-open]:not([data-no-highlight])
  ) {
    opacity: 1;
  }
`;

export default genGlobalStyle;
