// Fixture: a mapped option row where only the recommended option is primary.
import { Flexbox } from '@mcit-vendor/ui';
import { Button } from '@mcit-vendor/ui/base-ui';
import { memo } from 'react';

interface DecisionOption {
  id: string;
  label: string;
}

interface DecisionBarProps {
  onDecide: (id: string) => void;
  options: DecisionOption[];
  recommendedId?: string;
}

const DecisionBar = memo<DecisionBarProps>(({ onDecide, options, recommendedId }) => (
  <Flexbox horizontal gap={8}>
    {options.map((option) => (
      <Button
        key={option.id}
        type={option.id === recommendedId ? 'primary' : 'default'}
        onClick={() => onDecide(option.id)}
      >
        {option.label}
      </Button>
    ))}
  </Flexbox>
));

export default DecisionBar;
