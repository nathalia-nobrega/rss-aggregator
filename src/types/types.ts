import { IncomingMessage, OutgoingHttpHeaders } from "http";

// TODO: Understand and find a better folder structure for these types

export type Params = Record<string, string>;

export const JSON_CONTENT_TYPE: Partial<OutgoingHttpHeaders> = {
    "content-type": "application/json",
};

export interface RouterIncomingMessage extends IncomingMessage {
    params: Params;
}

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

export function isValidIdParam(id: string) {
    const uuidPattern =
        /^[0-9A-Fa-f]{8}(?:-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}$/gm;
    return uuidPattern.test(id);
}

export function isValidFeedUrl(url: string) {
    const feedUrlPattern = /https?:\/\/[^\/]+\/.*?\.(rss|xml)(\?.*)?$/i;
    return feedUrlPattern.test(url);
}

// Data that comes from RSS parser library (partial)
export type ExtractedFeedData = {
    title: string;
    description: string;
    url: string;
};

// Data that the parser extracts + my domain fields
export type RSSFeedData = ExtractedFeedData & {
    id: string;
    status: FeedStatus;
    priority: FeedPriority;
    // items: Array<RSSFeedItem>
};
