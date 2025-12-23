import { FeedPriority, FeedStatus } from "./enums.js";

export type RSSFeedCreateRequest = {
    feedUrl: string;
};

export type UpdateFeedRequest = {
    feedStatus: FeedStatus;
    feedPriority: FeedPriority;
    feedTitle: string;
};
