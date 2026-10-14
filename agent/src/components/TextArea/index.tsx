import { TextArea as TutTextArea, type TextAreaProps as Props } from '@mcit-vendor/ui/base-ui';
import { memo, useRef, useState } from 'react';

import { useIMECompositionEvent } from '@/hooks/useIMECompositionEvent';

interface TextAreaProps extends Omit<Props, 'onChange'> {
  onChange?: (value: string) => void;
}

const TextArea = memo<TextAreaProps>(({ onBlur, onChange, value: defaultValue, ...props }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { compositionProps, isComposingRef } = useIMECompositionEvent();

  const [value, setValue] = useState(defaultValue as string);

  return (
    <TutTextArea
      ref={ref}
      onBlur={(e) => {
        onChange?.(value);
        onBlur?.(e);
      }}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      {...compositionProps}
      onPressEnter={() => {
        if (isComposingRef.current) return;
        onChange?.(value);
      }}
      {...props}
      value={value ?? ''}
    />
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
