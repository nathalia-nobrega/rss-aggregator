import { FeedPriority, FeedStatus } from "./enums.js";

/**
 * Data that comes from RSS parser library (partial)
 */
export interface ExtractedFeedData {
    title: string;
    description: string;
    url: string;
}

/**
 * Complete feed data with domain fields
 * https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections
 */
export interface RSSFeedData extends ExtractedFeedData {
    id: string;
    status: FeedStatus;
    priority: FeedPriority;
    // items: Array<RSSFeedItem>
}
