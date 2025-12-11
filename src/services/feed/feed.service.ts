import { randomUUID } from "crypto";
import { FeedTypeError } from "../../errors/FeedTypeError.js";
import { RSSFeedData } from "../../types/index.js";
import Parser from "rss-parser";

function getTypeOfFeed(feedUrl: string): "XML" | "URL" | null {
    return feedUrl.endsWith(".rss")
        ? "URL"
        : feedUrl.endsWith(".xml")
        ? "XML"
        : null;
}

export async function extractFeed(feedUrl: string): Promise<RSSFeedData> {
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
