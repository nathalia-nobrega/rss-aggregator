import Parser from "rss-parser";

// TODO: Fix non whitespace bug

let parser = new Parser({
    xml2js: {},
});

async function parseFeed(feedUrl: string, feedType: "XML" | "URL") {
    if (feedType === "XML") {
        const res = await fetch(feedUrl);
        const text = await res.text();
        let feed = await parser.parseString(text);
        console.log(feed.title);
    } else {
        let feed = await parser.parseURL(feedUrl);
        console.log(feed.title);
    }
}

parseFeed("https://www.reddit.com/.rss", "URL");
parseFeed("https://sizeof.cat/index.xml", "XML");
parseFeed("https://beej.us/blog/rss.xml", "XML");
