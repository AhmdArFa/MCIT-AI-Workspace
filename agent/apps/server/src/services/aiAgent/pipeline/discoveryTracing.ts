import type { Span } from '@tut/observability-otel/api';
import { SpanStatusCode } from '@tut/observability-otel/api';

import { createStageTracer } from './sendTracing';

/**
 * Wrap an IO-bound discovery stage in a span. Discovery runs on the send path
 * before the operation exists, so these spans are the only breakdown of how
 * long a user waits between "message saved" and "operation started".
 */
export const traceDiscoveryStage = createStageTracer('tool_discovery');

/**
 * Surface failures a stage absorbed instead of throwing (settled promises,
 * degrade-to-empty services). Without this the span looks healthy and a
 * timeout is indistinguishable from "nothing to discover".
 */
export const markDegradedStage = (span: Span, failureCount: number, failedWhat: string) => {
  span.setAttribute('mcit.tool_discovery.failure_count', failureCount);
  if (failureCount > 0) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: `${failureCount} ${failedWhat} failed`,
    });
  }
};
