import Parser from "rss-parser";
import { FeedPriority, FeedStatus } from "../types/feed/enums.js";
import { RSSFeedData, RSSFeedDataDB } from "../types/feed/models.js";
import { User, UserDB } from "../types/user/models.js";
import { ArticleListItem } from "../types/article/models.js";
import { randomUUID } from "crypto";
import { normalizeArticlePubDate } from "../services/articles.service.js";
import { generateExcerpt } from "../types/article/validators.js";
import { generateContentHash } from "./content-hash.js";

export function entityToFeed(record: RSSFeedDataDB): RSSFeedData {
    return {
        id: record.id,
        link: record.url,
        title: record.title,
        description: record.description,
        status: record.status as FeedStatus,
        priority: record.priority as FeedPriority,
    };
}

export function entityToUser(record: UserDB): User {
    return {
        id: record.id,
        username: record.username,
        email: record.email,
        password: record.password,
    };
}

// TODO: This should have src from the article stored in the database
export function itemToArticleListItem(item: Parser.Item): ArticleListItem {
    return {
        id: randomUUID(),
        feedId: randomUUID(),
        title: item.title ?? "No title provided",
        link: item.link ?? "No link provided",
        pubDate: normalizeArticlePubDate(item),
        excerpt: generateExcerpt(item.contentSnippet!),
    };
}

export function itemToEntity(feedId: string, item: Parser.Item) {
    return {
        id: randomUUID(),
        feed_id: feedId,
        title: item.title ?? "No title provided",
        link: item.link ?? "No link provided",
        pub_date: normalizeArticlePubDate(item),
        content_hash: generateContentHash(item.content!),
        content: item.content ?? "No content provided",
    };
}
