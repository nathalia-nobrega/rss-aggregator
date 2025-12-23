export const FEED_STATUSES = ["active", "paused"] as const;
export type FeedStatus = (typeof FEED_STATUSES)[number];

export const FEED_PRIORITIES = ["high", "medium", "low"] as const;
export type FeedPriority = (typeof FEED_PRIORITIES)[number];
