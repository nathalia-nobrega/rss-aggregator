// type guard -> runtime code

import { NOMEM } from "dns";
import {
    FEED_PRIORITIES,
    FEED_STATUSES,
    FeedPriority,
    FeedStatus,
} from "./enums.js";

/**
 * Type guard for FeedStatus
 */
export function isFeedStatus(value: unknown): value is FeedStatus {
    return (
        typeof value === "string" && FEED_STATUSES.includes(value as FeedStatus)
    );
}

/**
 * Type guard for FeedPriority
 */
export function isFeedPriority(value: unknown): value is FeedPriority {
    return (
        typeof value === "string" &&
        FEED_PRIORITIES.includes(value as FeedPriority)
    );
}

/**
 * Validates feed URL format
 */
export function isValidFeedUrl(url: string) {
    const feedUrlPattern = /https?:\/\/[^\/]+\/.*?\.(rss|xml)(\?.*)?$/i;
    return feedUrlPattern.test(url);
}

export function normalizeUrl(url: string): string {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`;
}
