import { FeedPriority, FeedStatus } from "../types/feed/enums.js";
import { RSSFeedData, RSSFeedDataDB } from "../types/feed/models.js";

export function entityToFeed(record: RSSFeedDataDB): RSSFeedData {
    return {
        id: record.id,
        url: record.url,
        title: record.title,
        description: record.description,
        status: record.status as FeedStatus,
        priority: record.priority as FeedPriority,
    };
}
