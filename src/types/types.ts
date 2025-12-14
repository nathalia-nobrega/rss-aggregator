import { IncomingMessage } from "http";

// TODO: Understand and find a better folder structure for these types

type Params = Record<string, string>;

export interface RouterIncomingMessage extends IncomingMessage {
    params: Params;
}

export type RSSFeedData = {
    id: string;
    title: string | undefined;
    description: string | undefined;
    url: string | undefined;
    status: FeedStatus;
    priority: FeedPriority;
    // items: Array<RSSFeedItem>
};

export type RSSFeedCreateRequest = {
    feedUrl: string;
};

export type FeedStatus = "active" | "paused";

export type FeedPriority = "high" | "medium" | "low";

export type UpdateFeedRequest = {
    feedStatus: FeedStatus;
    feedPriority: FeedPriority;
    feedTitle: string;
};

// type guard -> runtime code

export const FEED_STATUSES = ["active", "paused"] as const;
export const FEED_PRIORITIES = ["high", "medium", "low"] as const;

export function isFeedStatus(value: unknown): value is FeedStatus {
    return (
        typeof value === "string" && FEED_STATUSES.includes(value as FeedStatus)
    );
}

export function isFeedPriority(value: unknown): value is FeedPriority {
    return (
        typeof value === "string" &&
        FEED_PRIORITIES.includes(value as FeedPriority)
    );
}
