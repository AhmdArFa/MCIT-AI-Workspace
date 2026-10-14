import { describe, expect, it } from 'vitest';

import rehypePlugin from './rehypePlugin';

describe('rehypePlugin', () => {
  it('should transform <tutArtifact> tags with attributes', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          children: [
            {
              type: 'raw',
              value: '<tutArtifact identifier="test-id" type="image/svg+xml" title="Test Title">',
            },
            { type: 'text', value: 'Artifact content' },
            { type: 'raw', value: '</tutArtifact>' },
          ],
        },
      ],
    };

    const expectedTree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'tutArtifact',
          properties: {
            identifier: 'test-id',
            type: 'image/svg+xml',
            title: 'Test Title',
          },
          children: [{ type: 'text', value: 'Artifact content' }],
        },
      ],
    };

    const plugin = rehypePlugin();
    plugin(tree);

    expect(tree).toEqual(expectedTree);
  });

  it('should handle mixed content with thinking tags and plain text', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          children: [{ type: 'text', value: 'Initial plain text paragraph' }],
        },
        {
          type: 'element',
          tagName: 'p',
          children: [
            { type: 'raw', value: '<tutThinking>' },
            { type: 'text', value: 'AI is thinking...' },
            { type: 'raw', value: '</tutThinking>' },
          ],
        },
        {
          type: 'element',
          tagName: 'p',
          children: [
            {
              type: 'raw',
              value: '<tutArtifact identifier="test-id" type="image/svg+xml" title="Test Title">',
            },
            { type: 'text', value: 'Artifact content' },
            { type: 'raw', value: '</tutArtifact>' },
          ],
        },
        {
          type: 'element',
          tagName: 'p',
          children: [{ type: 'text', value: 'Final plain text paragraph' }],
        },
      ],
    };

    const expectedTree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          children: [{ type: 'text', value: 'Initial plain text paragraph' }],
        },
        {
          type: 'element',
          tagName: 'p',
          children: [
            { type: 'raw', value: '<tutThinking>' },
            { type: 'text', value: 'AI is thinking...' },
            { type: 'raw', value: '</tutThinking>' },
          ],
        },
        {
          type: 'element',
          tagName: 'tutArtifact',
          properties: {
            identifier: 'test-id',
            type: 'image/svg+xml',
            title: 'Test Title',
          },
          children: [{ type: 'text', value: 'Artifact content' }],
        },
        {
          type: 'element',
          tagName: 'p',
          children: [{ type: 'text', value: 'Final plain text paragraph' }],
        },
      ],
    };

    const plugin = rehypePlugin();
    plugin(tree);

    expect(tree).toEqual(expectedTree);
  });

  it('should transform multiple <tutArtifact> tags in the same tree', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          children: [{ type: 'text', value: 'Here are two artifacts:' }],
        },
        {
          type: 'element',
          tagName: 'p',
          children: [
            {
              type: 'raw',
              value:
                '<tutArtifact identifier="first" type="text/markdown" title="First Artifact">',
            },
            { type: 'text', value: 'First content' },
            { type: 'raw', value: '</tutArtifact>' },
          ],
        },
        {
          type: 'element',
          tagName: 'p',
          children: [
            {
              type: 'raw',
              value:
                '<tutArtifact identifier="second" type="text/markdown" title="Second Artifact">',
            },
            { type: 'text', value: 'Second content' },
            { type: 'raw', value: '</tutArtifact>' },
          ],
        },
        {
          type: 'element',
          tagName: 'p',
          children: [{ type: 'text', value: 'Done.' }],
        },
      ],
    };

    const plugin = rehypePlugin();
    plugin(tree);

    // Both artifacts should be transformed
    expect(tree.children).toHaveLength(4);
    expect(tree.children[1]).toEqual({
      type: 'element',
      tagName: 'tutArtifact',
      properties: {
        identifier: 'first',
        type: 'text/markdown',
        title: 'First Artifact',
      },
      children: [{ type: 'text', value: 'First content' }],
    });
    expect(tree.children[2]).toEqual({
      type: 'element',
      tagName: 'tutArtifact',
      properties: {
        identifier: 'second',
        type: 'text/markdown',
        title: 'Second Artifact',
      },
      children: [{ type: 'text', value: 'Second content' }],
    });
  });

  it('should transform multiple raw <tutArtifact> nodes (without wrapping <p>)', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'raw',
          value: '<tutArtifact identifier="raw-1" type="text/html" title="Raw First">',
        },
        {
          type: 'raw',
          value: '<tutArtifact identifier="raw-2" type="text/html" title="Raw Second">',
        },
      ],
    };

    const plugin = rehypePlugin();
    plugin(tree);

    expect(tree.children).toHaveLength(2);
    expect((tree.children[0] as any).tagName).toBe('tutArtifact');
    expect((tree.children[1] as any).tagName).toBe('tutArtifact');
  });
});
