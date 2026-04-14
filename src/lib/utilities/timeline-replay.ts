import { parseJSON } from 'date-fns';

import type { WorkflowEvent } from '$lib/types/events';
import type { ValidTime } from '$lib/utilities/format-time';
import { isTimestamp, timestampToDate } from '$lib/utilities/format-time';

export function validTimeToMs(t: ValidTime | undefined | null): number | null {
  if (t == null) return null;
  try {
    if (isTimestamp(t)) {
      return timestampToDate(t).getTime();
    }
    return parseJSON(t as string).getTime();
  } catch {
    return null;
  }
}

export function filterEventsUpToTime(
  events: WorkflowEvent[],
  untilMs: number,
): WorkflowEvent[] {
  return events.filter((e) => {
    const ms = validTimeToMs(e.eventTime);
    return ms != null && ms <= untilMs;
  });
}

export function replayDurationMs(workflowDurationMs: number): number {
  const capped = Math.min(30_000, Math.max(workflowDurationMs, 1));
  return Math.min(30_000, Math.max(5000, capped));
}
