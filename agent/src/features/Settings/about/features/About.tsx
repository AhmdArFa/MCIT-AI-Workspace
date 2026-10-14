'use client';

import { SiGithub, SiX, SiYoutube } from '@icons-pack/react-simple-icons';
import {
  BRANDING_EMAIL,
  BRANDING_NAME,
  DEVELOPER_NAME,
  ORG_NAME,
  SOCIAL_URL,
} from '@tut/business-const';
import { Flexbox } from '@mcit-vendor/ui';
import { Divider, Text } from '@mcit-vendor/ui/base-ui';
import { Form } from '@mcit-vendor/ui/base-ui/form';
import { createStaticStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { mailTo, OFFICIAL_SITE, PRIVACY_URL, TERMS_URL } from '@/const/url';

import AboutList from './AboutList';
import ItemCard from './ItemCard';
import ItemLink from './ItemLink';
import Version from './Version';

const styles = createStaticStyles(({ css, cssVar }) => ({
  authorBox: css`
    padding: 14px 18px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 12px;
    background: ${cssVar.colorFillQuaternary};
  `,
  title: css`
    font-size: 14px;
    font-weight: bold;
    color: ${cssVar.colorTextSecondary};
  `,
}));

const About = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('common');

  const socialItems = [
    SOCIAL_URL.github
      ? {
          href: SOCIAL_URL.github,
          icon: SiGithub,
          label: 'GitHub',
          value: 'feedback',
        }
      : null,
    SOCIAL_URL.x
      ? {
          href: SOCIAL_URL.x,
          icon: SiX as any,
          label: 'X / Twitter',
          value: 'x',
        }
      : null,
    SOCIAL_URL.youtube
      ? {
          href: SOCIAL_URL.youtube,
          icon: SiYoutube,
          label: 'YouTube',
          value: 'youtube',
        }
      : null,
  ].filter(Boolean) as any[];

  return (
    <Form.Group
      collapsible={false}
      style={{ maxWidth: '1024px', width: '100%' }}
      title={`${t('about')} ${BRANDING_NAME}`}
      variant={'filled'}
    >
      <Flexbox gap={20} paddingBlock={20} width={'100%'}>
        <Version mobile={mobile} />
        <Divider style={{ marginBlock: 0 }} />

        <div className={styles.authorBox}>
          <Text fontSize={15} weight="bold">
            {ORG_NAME}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text fontSize={13} type="secondary">
              Lead Developer:{' '}
            </Text>
            <Text fontSize={13} weight="bold">
              {DEVELOPER_NAME}
            </Text>
          </div>
        </div>

        {socialItems.length > 0 && (
          <>
            <AboutList grid ItemRender={ItemCard} items={socialItems} />
            <Divider style={{ marginBlock: 0 }} />
          </>
        )}

        <div className={styles.title}>{t('contact')}</div>
        <AboutList
          ItemRender={ItemLink}
          items={[
            {
              href: OFFICIAL_SITE,
              label: t('officialSite'),
              value: 'officialSite',
            },
            {
              href: mailTo(BRANDING_EMAIL.support),
              label: t('mail.support'),
              value: 'support',
            },
            {
              href: mailTo(BRANDING_EMAIL.business),
              label: t('mail.business'),
              value: 'business',
            },
          ]}
        />
        <Divider style={{ marginBlock: 0 }} />
        <div className={styles.title}>{t('legal')}</div>
        <AboutList
          ItemRender={ItemLink}
          items={[
            {
              href: TERMS_URL,
              label: t('terms'),
              value: 'terms',
            },
            {
              href: PRIVACY_URL,
              label: t('privacy'),
              value: 'privacy',
            },
          ]}
        />
      </Flexbox>
    </Form.Group>
  );
});

export default About;
