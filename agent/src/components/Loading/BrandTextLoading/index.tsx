'use client';

import { BRANDING_NAME } from '@tut/business-const';
import Image from 'next/image';

import styles from './index.module.css';

interface BrandTextLoadingProps {
  debugId?: string;
}

const BrandTextLoading = ({ debugId }: BrandTextLoadingProps) => {
  const showDebug = process.env.NODE_ENV === 'development' && debugId;

  return (
    <div className={styles.container}>
      <div
        aria-label="Loading"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
        role="status"
      >
        <Image
          alt={BRANDING_NAME}
          height={64}
          priority
          src="/mcit-logo.webp"
          style={{
            objectFit: 'contain',
            animation: 'mcitPulse 1.8s ease-in-out infinite',
          }}
          unoptimized
          width={180}
        />
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--brand-muted-color)',
            textTransform: 'uppercase',
          }}
        >
          {BRANDING_NAME}
        </div>
      </div>
      {showDebug && (
        <div className={styles.debug}>
          <div className={styles.debugRow}>
            <code>Debug ID:</code>
            <span className={styles.debugTag}>
              <code>{debugId}</code>
            </span>
          </div>
          <div className={styles.debugHint}>only visible in development</div>
        </div>
      )}
      <style>{`
        @keyframes mcitPulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.55;
            transform: scale(0.97);
          }
        }
      `}</style>
    </div>
  );
};

export default BrandTextLoading;
