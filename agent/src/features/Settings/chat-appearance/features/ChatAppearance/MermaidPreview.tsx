import { type MermaidProps } from '@mcit-vendor/ui';
import { Center, Flexbox, Mermaid } from '@mcit-vendor/ui';

const code = `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!
`;

const MermaidPreview = ({ theme }: { theme?: MermaidProps['theme'] }) => {
  return (
    <Center>
      <Flexbox style={{ maxWidth: '100%' }} width={480}>
        <Mermaid theme={theme}>{code}</Mermaid>
      </Flexbox>
    </Center>
  );
};

export default MermaidPreview;
