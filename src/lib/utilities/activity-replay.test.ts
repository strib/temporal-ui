import { describe, expect, it } from 'vitest';

import {
  getReplayActivities,
  getReplayState,
  getReplayWindow,
  toReplayTimeMs,
} from './activity-replay';

describe('activity replay utilities', () => {
  it('parses string and protobuf timestamps', () => {
    expect(toReplayTimeMs('2024-05-17T15:25:26.888913Z')).toBe(1715959526888);
    expect(toReplayTimeMs({ seconds: '1715959526', nanos: 888913000 })).toBe(
      1715959526888,
    );
  });

  it('builds replay activities from activity groups only', () => {
    const activities = getReplayActivities([
      {
        id: '6',
        category: 'activity',
        eventList: [
          { eventTime: '2024-05-17T15:25:27.000Z' },
          { eventTime: '2024-05-17T15:25:29.000Z' },
        ],
      },
      {
        id: '9',
        category: 'workflow',
        eventList: [{ eventTime: '2024-05-17T15:25:30.000Z' }],
      },
      {
        id: '12',
        category: 'local-activity',
        eventList: [
          { eventTime: '2024-05-17T15:25:30.500Z' },
          { eventTime: '2024-05-17T15:25:31.000Z' },
        ],
      },
    ] as never[]);

    expect(activities).toStrictEqual([
      {
        id: '6',
        startTimeMs: 1715959527000,
        endTimeMs: 1715959529000,
      },
      {
        id: '12',
        startTimeMs: 1715959530500,
        endTimeMs: 1715959531000,
      },
    ]);
    expect(getReplayWindow(activities)).toStrictEqual({
      startTimeMs: 1715959527000,
      endTimeMs: 1715959531000,
      durationMs: 4000,
    });
  });

  it('reports replay state transitions', () => {
    const activity = {
      id: '6',
      startTimeMs: 1000,
      endTimeMs: 3000,
    };

    expect(getReplayState(activity, null)).toBe('idle');
    expect(getReplayState(activity, 500)).toBe('upcoming');
    expect(getReplayState(activity, 1000)).toBe('active');
    expect(getReplayState(activity, 2500)).toBe('active');
    expect(getReplayState(activity, 3500)).toBe('completed');
  });
});
