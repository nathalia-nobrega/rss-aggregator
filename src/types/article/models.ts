export type Article = {
    id: string;
    feedId: string;
    title: string;
    link: string;
    pubDate: number;
    contentHash: string;
    content: string;
    createdAt: number;
    updatedAt: number;
};

export type ArticleListItem = {
    id: string;
    feedId: string;
    title: string;
    link: string;
    pubDate: number;
    excerpt: string;
};
