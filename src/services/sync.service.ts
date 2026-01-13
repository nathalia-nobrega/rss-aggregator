import {
    findArticleByFeedIdAndLink,
    insertArticle,
    updateArticleById,
} from "../db/article.queries.js";
import {
    findAllActiveFeeds,
    markFeedAsErrored,
    markFeedAsSuccessful,
} from "../db/feed.queries.js";
import { processWithConcurrency } from "../utilities/concurrency.js";
import { parserItemToEntity } from "../utilities/transformers.js";
import { fetchArticles } from "./articles.service.js";
import { generateArticleSummary } from "./openai.service.js";

export async function syncOneFeed(
    feedId: string,
    feedUrl: string,
    priority: string
) {
    try {
        const fetchedArticles = await fetchArticles(feedUrl);
        const parsedArticles = fetchedArticles.map((article) =>
            parserItemToEntity(feedId, article)
        );
        let inserted = 0;
        let updated = 0;

        // dedup logic
        for (const parsedArticle of parsedArticles) {
            try {
                const existingArticle = findArticleByFeedIdAndLink.get(
                    feedId,
                    parsedArticle.link
                ) as { id: string; title: string; content_hash: string };

                if (!existingArticle) {
                    // if article doesn't exist, insert
                    let aiSummary = null;
                    if (priority === "high") {
                        aiSummary = await generateArticleSummary(
                            parsedArticle.title,
                            parsedArticle.content
                        );
                    }

                    insertArticle.run(
                        parsedArticle.id,
                        parsedArticle.feed_id,
                        parsedArticle.title,
                        parsedArticle.link,
                        parsedArticle.pub_date,
                        parsedArticle.content_hash,
                        parsedArticle.content,
                        parsedArticle.excerpt,
                        aiSummary
                    );
                } else {
                    // if article exists, verify if hashes are equal
                    const hasSameContent =
                        parsedArticle.content_hash ===
                        existingArticle.content_hash;
                    if (!hasSameContent) {
                        updateArticleById.run(
                            parsedArticle.title,
                            parsedArticle.pub_date,
                            parsedArticle.content_hash,
                            parsedArticle.content,
                            parsedArticle.excerpt,
                            existingArticle.id
                        );
                    }
                }
            } catch (err: any) {
                console.error(err.toString());
            }
        }
        markFeedAsSuccessful.get(feedId);
    } catch (err: any) {
        markFeedAsErrored.get(feedId);
        console.error(err.toString());
    }
}

let isRunning = false;

export async function syncAllFeeds() {
    if (isRunning) {
        console.log("[sync] Skipping: already running");
        return;
    }

    isRunning = true;
    console.debug("[sync] Starting sync cycle");

    try {
        const feeds = findAllActiveFeeds.all() as Array<{
            id: string;
            url: string;
            priority: string;
        }>;

        await processWithConcurrency(feeds, 5, async (feed) => {
            await syncOneFeed(feed.id, feed.url, feed.priority);
        });

        console.debug("[sync] Sync cycle completed");
    } catch (err: any) {
        console.error("[sync] Unexpected sync error:", err);
    } finally {
        isRunning = false;
    }
}

export function getSyncStatus() {
    return { isRunning };
}
