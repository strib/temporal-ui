import type { Timestamp } from '@temporalio/common';

import type { EventGroup } from '$lib/models/event-groups/event-groups';

export type ReplayActivity = {
  id: string;
  startTimeMs: number;
  endTimeMs: number;
};

export type ReplayWindow = {
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
};

const replayableCategories = new Set(['activity', 'local-activity']);

export const isReplayableActivityGroup = (
  group?: Pick<EventGroup, 'category'> | null,
): boolean => {
  return !!group && replayableCategories.has(group.category);
};

export const toReplayTimeMs = (
  value?: string | Date | Timestamp | null,
): number | null => {
  if (!value) return null;

  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? null : time;
  }

  if (typeof value === 'string') {
    const time = Date.parse(value);
    return Number.isNaN(time) ? null : time;
  }

  if (typeof value === 'object' && 'seconds' in value) {
    const seconds = Number(value.seconds ?? 0);
    const nanos = Number(value.nanos ?? 0);
    return seconds * 1000 + Math.floor(nanos / 1_000_000);
  }

  return null;
};

export const getReplayActivities = (groups: EventGroup[]): ReplayActivity[] => {
  return groups
    .filter(isReplayableActivityGroup)
    .map((group) => {
      const timestamps = group.eventList
        .map((event) => toReplayTimeMs(event.eventTime))
        .filter((time): time is number => time !== null);

      if (!timestamps.length) {
        return null;
      }

      return {
        id: group.id,
        startTimeMs: Math.min(...timestamps),
        endTimeMs: Math.max(...timestamps),
      };
    })
    .filter((activity): activity is ReplayActivity => activity !== null)
    .sort((left, right) => left.startTimeMs - right.startTimeMs);
};

export const getReplayWindow = (
  activities: ReplayActivity[],
): ReplayWindow | null => {
  if (!activities.length) return null;

  const startTimeMs = Math.min(...activities.map((activity) => activity.startTimeMs));
  const endTimeMs = Math.max(...activities.map((activity) => activity.endTimeMs));

  return {
    startTimeMs,
    endTimeMs,
    durationMs: Math.max(endTimeMs - startTimeMs, 0),
  };
};

export const getReplayState = (
  activity: ReplayActivity,
  replayCurrentTimeMs: number | null,
): 'idle' | 'upcoming' | 'active' | 'completed' => {
  if (replayCurrentTimeMs === null) return 'idle';
  if (replayCurrentTimeMs < activity.startTimeMs) return 'upcoming';
  if (replayCurrentTimeMs > activity.endTimeMs) return 'completed';
  return 'active';
};
