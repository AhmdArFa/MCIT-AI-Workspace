'use client';

import { Flexbox } from '@mcit-vendor/ui';
import { Button } from '@mcit-vendor/ui/base-ui';
import { cssVar } from 'antd-style';
import { Undo2Icon } from 'lucide-react';
import { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import TutMessage from '@/features/Onboarding/components/TutMessage';

import ComposioServerList from '../components/ComposioServerList';

interface ProSettingsStepProps {
  onBack: () => void;
  onNext: () => void;
}

const ProSettingsStep = memo<ProSettingsStepProps>(({ onBack, onNext }) => {
  const { t } = useTranslation('onboarding');

  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);

  const handleNext = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsNavigating(true);
    onNext();
  }, [onNext]);

  const handleBack = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsNavigating(true);
    onBack();
  }, [onBack]);

  return (
    <Flexbox gap={16}>
      <TutMessage sentences={[t('proSettings.connectors.title')]} />

      <ComposioServerList />

      <Flexbox horizontal align={'center'} justify={'space-between'} style={{ marginTop: 16 }}>
        <Button
          disabled={isNavigating}
          icon={Undo2Icon}
          type={'text'}
          style={{
            color: cssVar.colorTextDescription,
          }}
          onClick={handleBack}
        >
          {t('back')}
        </Button>
        <Button
          disabled={isNavigating}
          style={{ minWidth: 120 }}
          type="primary"
          onClick={handleNext}
        >
          {t('next')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

ProSettingsStep.displayName = 'ProSettingsStep';

export default ProSettingsStep;
