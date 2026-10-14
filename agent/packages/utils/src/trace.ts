import type { TracePayload } from '@tut/const';
import { TUT_CHAT_TRACE_HEADER, TUT_CHAT_TRACE_ID } from '@tut/const';
import { Buffer } from 'buffer.js';

export const getTracePayload = (req: Request): TracePayload | undefined => {
  const header = req.headers.get(TUT_CHAT_TRACE_HEADER);
  if (!header) return;

  try {
    return JSON.parse(Buffer.from(header, 'base64').toString('utf8'));
  } catch {
    // Ignore malformed trace header - return undefined to skip tracing
    return undefined;
  }
};

export const getTraceId = (res: Response) => res.headers.get(TUT_CHAT_TRACE_ID);

const createTracePayload = (data: TracePayload) => {
  const buffer = new TextEncoder().encode(JSON.stringify(data));

  return Buffer.from(buffer).toString('base64');
};

export const createTraceHeader = (data: TracePayload) => {
  return { [TUT_CHAT_TRACE_HEADER]: createTracePayload(data) };
};
