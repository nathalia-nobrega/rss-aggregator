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

/**
 * Data that comes from the database
 */
export type RSSFeedDataDB = {
    id: string;
    user_id: string;
    url: string;
    normalized_url: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    last_fetched: string;
    error_count: string;
    created_at: string;
    updated_at: string;
};
