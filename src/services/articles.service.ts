import path, { dirname } from "path";
import Parser from "rss-parser";
import { fileURLToPath } from "url";
import * as fs from "node:fs";
import { generateExcerpt } from "../types/article/validators.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * TESTING DATA
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

// START for consulting (from the code of the rss-parser library):
export interface Output<U> {
    image?: {
        link?: string;
        url: string;
        title?: string;
    };
    link?: string;
    title?: string;
    items: (U & Item)[];
    feedUrl?: string;
    description?: string;
    // etc...
}

export interface Item {
    title?: string;
    link?: string;
    pubDate?: string;
    creator?: string;
    content?: string;
    contentSnippet?: string;
    isoDate?: string;
}
// END from the code of the rss-parser library

export async function fetchArticles(feedUrl: string, feedType: "XML" | "URL") {
    let parser = new Parser();
    if (feedType === "XML") {
        const res = await fetch(feedUrl);
        const text = await res.text();
        return (await parser.parseString(text)).items as Parser.Item[];
    }
    return (await parser.parseURL(feedUrl)).items as Parser.Item[];
}

export async function writeItemsToFile(items: Parser.Item[]) {
    // This is for testing purposes,
    // Printing the items in the console/terminal is pretty awful
    const outputFile = "articles_from_feed_test.json";
    const outputPath = path.resolve(__dirname, "..", "..", outputFile);
    await fs.promises.writeFile(outputPath, JSON.stringify(items), "utf-8");
}

/**
 *
 * Policy:
 * First candidate: isoDate (same format across all RSS feeds)
 * Second candidate: pubDate (tends to differ depending on the feed)
 *
 * return UTC date
 */
export function normalizeArticlePubDate(item: Parser.Item): number {
    const candidate = item.isoDate ?? item.pubDate;
    if (!candidate) {
        return Date.now();
    }

    return Date.parse(candidate);
}
