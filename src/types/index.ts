export type RSSFeedData = {
    id: string;
    title: string | undefined;
    description: string | undefined;
    url: string | undefined;
    // items: Array<RSSFeedItem>
};

export type RSSFeedCreateRequest = {
    feedUrl: string;
};
