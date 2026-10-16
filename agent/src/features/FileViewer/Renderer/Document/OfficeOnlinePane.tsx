'use client';

import { Flexbox } from '@mcit-vendor/ui';
import { ActionIcon } from '@mcit-vendor/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { Download, ExternalLink, RotateCw } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

const styles = createStaticStyles(({ css }) => ({
  container: css`
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    border-radius: 4px;
    background: ${cssVar.colorBgContainer};
  `,
  toolbar: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: ${cssVar.colorBgElevated};
    border-bottom: 1px solid ${cssVar.colorBorderSecondary};
    font-size: 12px;
    font-weight: 500;
  `,
  title: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 60%;
    color: ${cssVar.colorTextSecondary};
  `,
  actions: css`
    display: flex;
    gap: 8px;
    align-items: center;
  `,
  frame: css`
    flex: 1;
    width: 100%;
    height: 100%;
    border: 0;
  `,
}));

interface OfficeOnlinePaneProps {
  fileId?: string;
  fileName?: string;
  url?: string;
}

const OfficeOnlinePane = memo<OfficeOnlinePaneProps>(({ fileId, fileName, url }) => {
  const [reloadKey, setReloadKey] = useState(0);

  const embedUrl = useMemo(() => {
    const target = fileName || fileId || '';
    return `http://localhost:8502/files?open=${encodeURIComponent(target)}&embed=true`;
  }, [fileId, fileName]);

  const handleOpenExternal = () => {
    const target = fileId || fileName || '';
    window.open(`http://localhost:8502/files?open=${encodeURIComponent(target)}`, '_blank');
  };

  const handleDownload = () => {
    if (url) {
      const a = document.createElement('a');
      a.href = url.includes('download=') ? url : `${url}${url.includes('?') ? '&' : '?'}download=1`;
      a.download = fileName || 'document';
      a.click();
    }
  };

  return (
    <Flexbox className={styles.container} height={'100%'} id="onlyoffice-renderer" width={'100%'}>
      <div className={styles.toolbar}>
        <span className={styles.title} title={fileName}>
          {fileName || 'ONLYOFFICE Document'}
        </span>
        <div className={styles.actions}>
          <ActionIcon
            icon={RotateCw}
            size={'small'}
            title={'Reload Editor'}
            onClick={() => setReloadKey((k) => k + 1)}
          />
          {url && (
            <ActionIcon
              icon={Download}
              size={'small'}
              title={'Download Document'}
              onClick={handleDownload}
            />
          )}
          <ActionIcon
            icon={ExternalLink}
            size={'small'}
            title={'Open in Full Editor (New Tab)'}
            onClick={handleOpenExternal}
          />
        </div>
      </div>
      <iframe
        key={reloadKey}
        allow="autoplay; camera; microphone; display-capture"
        className={styles.frame}
        id="onlyoffice-iframe"
        src={embedUrl}
        title={fileName || 'ONLYOFFICE Document'}
      />
    </Flexbox>
  );
});

OfficeOnlinePane.displayName = 'OfficeOnlinePane';

export default OfficeOnlinePane;
