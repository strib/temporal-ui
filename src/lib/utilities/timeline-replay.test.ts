import { describe, expect, it } from 'vitest';

import type { WorkflowEvent } from '$lib/types/events';

import {
  filterEventsUpToTime,
  replayDurationMs,
  validTimeToMs,
} from './timeline-replay';

describe('timeline-replay', () => {
  it('validTimeToMs parses ISO strings', () => {
    expect(validTimeToMs('2020-01-01T00:00:00.000Z')).toBe(
      new Date('2020-01-01T00:00:00.000Z').getTime(),
    );
  });

  it('filterEventsUpToTime keeps events at or before the cutoff', () => {
    const events = [
      { eventTime: '2020-01-01T00:00:00.000Z' },
      { eventTime: '2020-01-01T00:00:01.000Z' },
      { eventTime: '2020-01-01T00:00:02.000Z' },
    ] as WorkflowEvent[];
    const cutoff = new Date('2020-01-01T00:00:01.000Z').getTime();
    const filtered = filterEventsUpToTime(events, cutoff);
    expect(filtered).toHaveLength(2);
  });

  it('replayDurationMs clamps to a reasonable range', () => {
    expect(replayDurationMs(100)).toBe(5000);
    expect(replayDurationMs(60_000)).toBe(30_000);
  });
});
