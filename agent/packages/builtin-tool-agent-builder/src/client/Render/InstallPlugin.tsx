'use client';

import type { BuiltinRenderProps } from '@tut/types';
import { Flexbox } from '@mcit-vendor/ui';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { memo } from 'react';

import type { InstallPluginParams, InstallPluginState } from '../../types';

const InstallPlugin = memo<BuiltinRenderProps<InstallPluginParams, InstallPluginState>>(
  ({ pluginState }) => {
    const {
      pluginId,
      pluginName,
      installed,
      awaitingApproval,
      isComposio,
      isMcitSkill,
      serverStatus,
      error,
    } = pluginState || {};

    if (!pluginId) return null;

    // Error state
    if (error) {
      return (
        <Flexbox horizontal align={'center'} gap={8} style={{ fontSize: 13 }}>
          <XCircle size={14} style={{ color: 'var(--tut-error-6)' }} />
          <span style={{ fontWeight: 500 }}>
            Failed to install plugin:{' '}
            <code
              style={{
                background: 'var(--tut-fill-tertiary)',
                borderRadius: 4,
                color: 'var(--tut-text)',
                fontSize: 12,
                padding: '2px 6px',
              }}
            >
              {pluginName || pluginId}
            </code>
          </span>
        </Flexbox>
      );
    }

    // Awaiting approval state
    if (awaitingApproval) {
      return (
        <Flexbox horizontal align={'center'} gap={8} style={{ fontSize: 13 }}>
          <Clock size={14} style={{ color: 'var(--tut-warning-6)' }} />
          <span style={{ fontWeight: 500 }}>
            {isComposio || isMcitSkill ? (
              <>
                Waiting for authorization:{' '}
                <code
                  style={{
                    background: 'var(--tut-fill-tertiary)',
                    borderRadius: 4,
                    color: 'var(--tut-text)',
                    fontSize: 12,
                    padding: '2px 6px',
                  }}
                >
                  {pluginName || pluginId}
                </code>
                {serverStatus === 'pending_auth' && (
                  <span style={{ color: 'var(--tut-text-tertiary)', marginLeft: 8 }}>
                    (OAuth required)
                  </span>
                )}
              </>
            ) : (
              <>
                Waiting for installation approval:{' '}
                <code
                  style={{
                    background: 'var(--tut-fill-tertiary)',
                    borderRadius: 4,
                    color: 'var(--tut-text)',
                    fontSize: 12,
                    padding: '2px 6px',
                  }}
                >
                  {pluginName || pluginId}
                </code>
              </>
            )}
          </span>
        </Flexbox>
      );
    }

    // Installed state
    if (installed) {
      return (
        <Flexbox horizontal align={'center'} gap={8} style={{ fontSize: 13 }}>
          <CheckCircle size={14} style={{ color: 'var(--tut-success-6)' }} />
          <span style={{ fontWeight: 500 }}>
            {isComposio || isMcitSkill ? 'Connected and enabled' : 'Installed and enabled'}:{' '}
            <code
              style={{
                background: 'var(--tut-fill-tertiary)',
                borderRadius: 4,
                color: 'var(--tut-text)',
                fontSize: 12,
                padding: '2px 6px',
              }}
            >
              {pluginName || pluginId}
            </code>
          </span>
        </Flexbox>
      );
    }

    return null;
  },
);

export default InstallPlugin;
