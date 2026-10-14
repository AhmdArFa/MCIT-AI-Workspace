// Fixture: a card dumping the raw provider error into a red Alert.
import { Flexbox } from '@mcit-vendor/ui';
import { Alert } from '@mcit-vendor/ui/base-ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface RunResultProps {
  error?: { message: string; stack?: string };
  output?: string;
}

const RunResult = memo<RunResultProps>(({ error, output }) => {
  const { t } = useTranslation('chat');

  if (error)
    return (
      // alint-expect
      <Alert
        showIcon
        description={`${error.message}\n${error.stack ?? ''}`}
        message={t('run.failed')}
        type={'error'}
      />
    );

  return <Flexbox>{output}</Flexbox>;
});

export default RunResult;
