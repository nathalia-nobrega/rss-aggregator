import Parser from "rss-parser";

let parser = new Parser();

export async function parseFeed(feedUrl: string, feedType: "XML" | "URL") {
    if (feedType === "XML") {
        const res = await fetch(feedUrl);
        const text = await res.text();
        return (await parser.parseString(text)) as Parser.Output<{
            [key: string]: any;
        }>;
    }
    return await parser.parseURL(feedUrl);
}

parseFeed("https://www.reddit.com/.rss", "URL");
// parseFeed("https://sizeof.cat/index.xml", "XML");
// parseFeed("https://beej.us/blog/rss.xml", "XML");
