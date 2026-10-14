import { ARTIFACT_THINKING_TAG_REGEX } from '@tut/const';

const ARTIFACT_TAG_REGEX_GLOBAL =
  /<tutArtifact\b[^>]*>(?<content>[\S\s]*?)(?:<\/tutArtifact>|$)/g;

// Match only the `tutAgents` tag itself (self-closing `/>` or a bare opening
// `>`), never the content that follows it. The card is built purely from the
// tag's attributes (the rehype plugin renders it with no children), so there is
// nothing to capture inside. A previous `>([\S\s]*?)(?:<\/tutAgents>|$)` form
// fell back to `$` when a model omitted the self-closing slash and emitted
// `<tutAgents ...>`; with no `</tutAgents>` to anchor on, it swallowed the
// rest of the message and stripped its newlines, collapsing all trailing
// block-level Markdown (headings, tables, `---`) into one paragraph.
const AGENTS_TAG_REGEX_GLOBAL = /<tutAgents\b[^>]*>/g;

/**
 * Replace all line breaks in the matched `tutArtifact` tag with an empty string
 */
export const processWithArtifact = (input: string = '') => {
  // First remove outer fenced code block if it exists
  /* eslint-disable regexp/no-super-linear-backtracking */
  let output = input.replace(
    /^([\s\S]*?)\s*```[^\n]*\n((?:<tutThinking>[\s\S]*?<\/tutThinking>[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*)?<tutArtifact[\s\S]*?<\/tutArtifact>\s*)\n```\s*([\s\S]*)$/,
    (_, before = '', content, after = '') => {
      return [before.trim(), content.trim(), after.trim()].filter(Boolean).join('\n\n');
    },
  );
  /* eslint-enable regexp/no-super-linear-backtracking */

  const thinkMatch = ARTIFACT_THINKING_TAG_REGEX.exec(output);

  // If the input contains the `tutThinking` tag, replace all line breaks with an empty string
  if (thinkMatch) {
    output = output.replace(ARTIFACT_THINKING_TAG_REGEX, (match) =>
      match.replaceAll(/\r?\n|\r/g, ''),
    );
  }

  // Add empty line between tutThinking and tutArtifact if they are adjacent
  // Support both cases: with line break (e.g. from other models) and without (e.g. from Gemini)
  output = output.replace(/(<\/tutThinking>)(?:\r?\n)?(<tutArtifact)/, '$1\n\n$2');

  // Remove fenced code block between tutArtifact and HTML content
  output = output.replace(
    /(<tutArtifact[^>]*>)\s*```[^\n]*\n([\s\S]*?)(```\n)?(<\/tutArtifact>)/,
    (_, start, content, __, end) => {
      if (content.trim().startsWith('<!DOCTYPE html') || content.trim().startsWith('<html')) {
        return start + content.trim() + end;
      }
      return start + content + (__ || '') + end;
    },
  );

  // Keep existing code blocks that are not part of tutArtifact
  output = output.replace(
    /^([\s\S]*?)(<tutThinking>[\s\S]*?<\/tutThinking>[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*<tutArtifact[\s\S]*?<\/tutArtifact>)([\s\S]*)$/,
    (_, before, content, after) => {
      return [before.trim(), content.trim(), after.trim()].filter(Boolean).join('\n\n');
    },
  );

  // If the input contains `tutArtifact` tags, replace all line breaks with an empty string
  // Use global regex to handle multiple artifacts in the same message
  // Keep artifact markup as one raw HTML segment for the rehype artifact plugin. Preserving
  // script block newlines here can make Markdown parse script text outside the custom tag.
  output = output.replaceAll(ARTIFACT_TAG_REGEX_GLOBAL, (match) =>
    match.replaceAll(/\r?\n|\r/g, ''),
  );

  // if not match, check if it's start with <tutArtifact but not closed
  const regex = /<tutArtifact\b(?:(?!\/?>)[\s\S])*$/;
  if (regex.test(output)) {
    output = output.replace(regex, '<tutArtifact>');
  }

  // Strip newlines inside the tutAgents tag so attributes spread across lines
  // stay a single contiguous raw HTML node for the rehype agents plugin.
  output = output.replaceAll(AGENTS_TAG_REGEX_GLOBAL, (match) => match.replaceAll(/\r?\n|\r/g, ''));

  return output;
};

// Preprocessing function: ensure two newlines before and after think tags.
// Thinking is a leading block, not an inline construct: normalization only
// applies when the message itself starts with a <think> tag. A <think> tag
// appearing mid-message (e.g. the model quoting it inside backticks) must stay
// untouched — inserting newlines around it would split the paragraph and render
// a stray "Thinking" collapsible in the middle of the reply.
export const normalizeThinkTags = (input: string) => {
  if (!input.trimStart().startsWith('<think>')) return input;

  return (
    input
      // Ensure two newlines after the leading <think> tag
      .replace(/^(\s*<think>)\s*([^\n])/, '$1\n\n$2')
      // Ensure two newlines before and after the first </think> tag
      .replace(/([^\n])\s*(<\/think>)/, '$1\n\n$2')
      .replace(/(<\/think>)\s*([^\n])/, '$1\n\n$2')
      // Remove excess newlines that may have been introduced
      .replaceAll(/\n{3,}/g, '\n\n')
  );
};
