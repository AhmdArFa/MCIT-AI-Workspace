import { RouteVariants } from '@tut/desktop-bridge';

import { type DynamicLayoutProps } from '@/types/next';

export { TUT_LOCALE_COOKIE } from '@/const/locale';
export {
  DEFAULT_LANG,
  DEFAULT_VARIANTS,
  type IRouteVariants,
  type Locales,
  locales,
} from '@tut/desktop-bridge';

class NextRouteVariants extends RouteVariants {
  static getVariantsFromProps = async (props: DynamicLayoutProps) => {
    const { variants } = await props.params;
    return super.deserializeVariants(variants);
  };
  static getIsMobile = async (props: DynamicLayoutProps) => {
    const { variants } = await props.params;
    const { isMobile } = super.deserializeVariants(variants);
    return isMobile;
  };
  static getLocale = async (props: DynamicLayoutProps) => {
    const { variants } = await props.params;
    const { locale } = super.deserializeVariants(variants);
    return locale;
  };
}

export { NextRouteVariants as RouteVariants };
