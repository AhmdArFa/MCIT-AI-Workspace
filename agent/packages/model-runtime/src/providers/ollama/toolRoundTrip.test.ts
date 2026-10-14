import { describe, expect, it } from 'vitest';

import { TutOllamaAI } from './index';

describe('Ollama tool round trip', () => {
  it('keeps assistant tool calls and names the tool each result answers', async () => {
    const ai = new TutOllamaAI({ baseURL: 'http://127.0.0.1:11434' });
    const out = await (ai as any).buildOllamaMessages([
      { content: 'List my notebooks', role: 'user' },
      {
        content: '',
        role: 'assistant',
        tool_calls: [{ function: { arguments: '{"limit":5}', name: 'notebooks_list' }, id: 'call_1', type: 'function' }],
      },
      { content: '[{"name":"Digital Egypt 2030"}]', role: 'tool', tool_call_id: 'call_1' },
    ]);
    expect(out[1].tool_calls).toEqual([{ function: { arguments: { limit: 5 }, name: 'notebooks_list' } }]);
    expect(out[2]).toMatchObject({ role: 'tool', tool_name: 'notebooks_list' });
  });

  it('tolerates empty or invalid argument strings', async () => {
    const ai = new TutOllamaAI({ baseURL: 'http://127.0.0.1:11434' });
    const out = await (ai as any).buildOllamaMessages([
      { content: '', role: 'assistant', tool_calls: [{ function: { arguments: '', name: 'a' }, id: 'x' }] },
      { content: '', role: 'assistant', tool_calls: [{ function: { arguments: '{bad', name: 'b' }, id: 'y' }] },
    ]);
    expect(out[0].tool_calls[0].function.arguments).toEqual({});
    expect(out[1].tool_calls[0].function.arguments).toEqual({});
  });
});
