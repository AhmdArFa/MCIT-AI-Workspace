'use client';

import { BRANDING_NAME, ORG_NAME } from '@tut/business-const';
import { Flexbox } from '@mcit-vendor/ui';
import { Button, Text } from '@mcit-vendor/ui/base-ui';
import { ShieldAlert, UserCheck, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AuthCard } from '@/features/AuthCard';

const BetterAuthSignUpForm = () => {
  const navigate = useNavigate();

  const footer = (
    <Flexbox horizontal justify="center" gap={8}>
      <Text type="secondary" fontSize={13}>
        Already have an assigned account?
      </Text>
      <a
        style={{ color: 'var(--ant-color-primary)', cursor: 'pointer', fontWeight: 600 }}
        onClick={() => navigate('/signin')}
      >
        Sign In
      </a>
    </Flexbox>
  );

  return (
    <AuthCard footer={footer} title={`Registration Restricted — ${BRANDING_NAME}`}>
      <Flexbox gap={18} style={{ padding: '8px 0 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            borderRadius: 12,
            background: 'var(--ant-color-fill-tertiary)',
            border: '1px solid var(--ant-color-border-secondary)',
          }}
        >
          <ShieldAlert size={28} style={{ color: 'var(--ant-color-warning)', flexShrink: 0 }} />
          <div>
            <Text weight="bold" fontSize={14}>
              Public Registration Disabled
            </Text>
            <div style={{ fontSize: 13, color: 'var(--ant-color-text-secondary)', marginTop: 2 }}>
              In accordance with {ORG_NAME} security policies, self-registration is closed.
            </div>
          </div>
        </div>

        <Text type="secondary" fontSize={13} style={{ lineHeight: 1.6 }}>
          All user accounts, credentials, and roles are provisioned exclusively by the designated
          organization administrator. If you require access, please contact your MCIT IT department.
        </Text>

        <Flexbox gap={10} style={{ marginTop: 8 }}>
          <Button block size="large" type="primary" icon={<UserCheck size={18} />} onClick={() => navigate('/signin')}>
            Go to Official Sign In
          </Button>

          <Button block size="large" icon={<Shield size={18} />} onClick={() => navigate('/admin')}>
            Administrator Control Portal
          </Button>
        </Flexbox>
      </Flexbox>
    </AuthCard>
  );
};

export default BetterAuthSignUpForm;
