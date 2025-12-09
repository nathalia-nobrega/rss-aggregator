import { randomUUID } from "crypto";
import { FeedTypeError } from "../../errors/FeedTypeError.js";
import { RSSFeedData } from "../../types/index.js";
import { parseFeed } from "../../utils/rss-feed-parser.js";

function getTypeOfFeed(feedUrl: string): "XML" | "URL" | null {
    return feedUrl.endsWith(".rss")
        ? "URL"
        : feedUrl.endsWith(".xml")
        ? "XML"
        : null;
}

async function extractFeed(feedUrl: string): Promise<RSSFeedData> {
    const feedType = getTypeOfFeed(feedUrl);
    if (!feedType)
        throw new FeedTypeError(
            "Invalid feed URL format. Expected .xml or .rss extension"
        );
    const feed = await parseFeed(feedUrl, feedType);
    return {
        id: randomUUID(),
        description: feed.description,
        title: feed.title,
        url: feed.link,
    };
}
