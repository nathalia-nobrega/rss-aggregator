import Parser from "rss-parser";
import { ExtractedFeedData } from "../../types/feed/models.js";
import path from "path";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getTypeOfFeed(feedUrl: string): "XML" | "URL" {
    return feedUrl.endsWith(".rss") ? "URL" : "XML";
}

export async function extractFeed(feedUrl: string): Promise<ExtractedFeedData> {
    const feedType = getTypeOfFeed(feedUrl);
    const feed = await parseFeed(feedUrl, feedType);

    // This is for testing purposes,
    // Printing the items in the console/terminal is pretty awful
    const outputFile = "feed.json";
    const outputPath = path.resolve(__dirname, "..", "..", outputFile);
    await fs.promises.writeFile(
        outputPath,
        JSON.stringify(feed.items),
        "utf-8"
    );
    return {
        description: feed.description || "No description found",
        title: feed.title || "Untitled Feed",
        url: feed.feedUrl || "No URL found",
    };
}

/**
 * VERY IMPORTANT NOTE:
 * The rss-parser library changes the URL of XML feeds.
 * If I pass https://beej.us/blog/rss.xml,
 * the library parses it and gives me http://beej.us/blog/rss.xml,
 * changing the HTTPS to HTTP.
 *
 */
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

/**
 * TESTING DATA BELOW
 */

// https://www.reddit.com/.rss
// https://sizeof.cat/index.xml
// https://beej.us/blog/rss.xml
// https://unixsheikh.com/feed.rss"
// https://cheapskatesguide.org/cheapskates-guide-rss-feed.xml

// From reddit's feed: title, link, pubDate, author, content, contentSnippet, isoDate
// From unixsheikh's feed: title, link, pubDate, content, contentSnippet, isoDate
// From cheap skate's guide: title, link, pubDate, author, content, contentSnippet, isoDate

// Something to note: the three feeds that I fetched are returning
// the pubDate in different formats (below). Maybe it's safer to use isoDate?
// See if I can just adjust them to one single format before persisting in the database

// 1 - 2025-12-30T23:03:51.000Z
// 2 - Wed, 08 Oct 2025 00:00:00 GMT
// 3 - 19 Dec 2025 04:16:00 GMT
