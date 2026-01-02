export type ArticleDetailedEntity = {
    id: string;
    feed_id: string;
    title: string;
    link: string;
    pub_date: number;
    content: string;
};

export type ArticleListItemEntity = {
    id: string;
    feed_id: string;
    title: string;
    link: string;
    pub_date: number;
    excerpt: string;
};

export type ArticleListItem = {
    id: string;
    feedId: string;
    title: string;
    link: string;
    pubDate: number;
    excerpt: string;
};
