import { randomUUID } from "crypto";
import { FeedTypeError } from "../../errors/FeedTypeError.js";
import Parser from "rss-parser";
import { ExtractedFeedData } from "../../types/feed/models.js";

function getTypeOfFeed(feedUrl: string): "XML" | "URL" | null {
    return feedUrl.endsWith(".rss")
        ? "URL"
        : feedUrl.endsWith(".xml")
        ? "XML"
        : null;
}

export async function extractFeed(feedUrl: string): Promise<ExtractedFeedData> {
    const feedType = getTypeOfFeed(feedUrl);
    if (!feedType)
        throw new FeedTypeError(
            "Invalid feed URL format. Expected .xml or .rss extension"
        );
    const feed = await parseFeed(feedUrl, feedType);
    return {
        description: feed.description || "No description found",
        title: feed.title || "Untitled Feed",
        url: feed.feedUrl || "No URL found",
    };
}

export async function parseFeed(feedUrl: string, feedType: "XML" | "URL") {
    let parser = new Parser();
    if (feedType === "XML") {
        const res = await fetch(feedUrl);
        const text = await res.text();
        return (await parser.parseString(text)) as Parser.Output<{
            [key: string]: any;
        }>;
    }
    return await parser.parseURL(feedUrl);
}

// parseFeed("https://www.reddit.com/.rss", "URL");
// parseFeed("https://sizeof.cat/index.xml", "XML");
// parseFeed("https://beej.us/blog/rss.xml", "XML");
