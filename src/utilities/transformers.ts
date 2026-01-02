import Parser from "rss-parser";
import { FeedPriority, FeedStatus } from "../types/feed/enums.js";
import { RSSFeedData, RSSFeedDataDB } from "../types/feed/models.js";
import { User, UserDB } from "../types/user/models.js";
import {
    ArticleDetailedEntity,
    ArticleListItem,
    ArticleListItemEntity,
} from "../types/article/models.js";
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

export function entityToDetailedArticle(row: ArticleDetailedEntity) {
    return {
        id: row.id,
        feedId: row.feed_id,
        title: row.title,
        link: row.link,
        pubDate: row.pub_date,
        content: row.content,
    };
}

export function entityToArticleListItem(
    row: ArticleListItemEntity
): ArticleListItem {
    return {
        id: row.id,
        feedId: row.feed_id,
        title: row.title,
        link: row.link,
        pubDate: row.pub_date,
        excerpt: row.excerpt,
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
        excerpt: generateExcerpt(item.contentSnippet!),
    };
}
