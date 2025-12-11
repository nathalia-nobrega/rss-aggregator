import { IncomingMessage, ServerResponse } from "http";
import { RSSFeedCreateRequest, RSSFeedData } from "../../types/index.js";
import { randomUUID } from "crypto";
import { extractFeed } from "../../services/feed/feed.service.js";

let data: Array<RSSFeedData> = [
    {
        id: randomUUID(),
        title: "Beej's Blog",
        description: "something",
        url: "https://beej.us/blog/rss.xml",
    },
];

// Note: In all of these handlers, I am assuming that url is not undefined since I already validate that in server.ts
// I know there are better ways to handle this and this could possible lead to errors in a more complex codebase,
// But for now I believe this is an okay thing to do.

export const getAllFeedsHandler = async (
    req: IncomingMessage,
    res: ServerResponse
) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify("data"));
};

export const addNewFeed = async (req: IncomingMessage, res: ServerResponse) => {
    let body = "";

    req.setEncoding("utf-8");

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        try {
            const newFeedLink: RSSFeedCreateRequest = JSON.parse(body);
            const newFeed: RSSFeedData = await extractFeed(newFeedLink.feedUrl);
            data.push(newFeed);
            res.writeHead(201, { "content-type": "application/json" });
            res.end(JSON.stringify(newFeed));
        } catch (err: any) {
            res.writeHead(400, { "content-type": "application/json" });
            res.end(JSON.stringify(err.toString()));
        }
    });
};

export const getFeedById = async (
    req: IncomingMessage,
    res: ServerResponse
) => {
    const { url } = req;

    try {
        const id = url?.substring(url.lastIndexOf("/") + 1);
        if (id?.length === 0)
            throw new Error("Required parameter 'id' not found");

        const feedFound = data.find((feed) => feed.id === id);

        if (!feedFound)
            throw new Error("Couldn't find a feed with the given id");

        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(feedFound));
    } catch (err: any) {
        console.error(err);
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify(err.toString()));
    }
};

export const updateFeed = async (req: IncomingMessage, res: ServerResponse) => {
    const { url } = req;
    try {
        const id = url?.substring(url.lastIndexOf("/") + 1);
        if (id?.length === 0)
            throw new Error("Required parameter 'id' not found");
        let body = "";

        req.setEncoding("utf-8");

        req.on("data", (chunk) => {
            body += chunk.toString();

            req.on("end", () => {
                // TODO: Throw an error if there is an existing feed with the same URL
                let existingFeed = data.find((feed) => feed.id === id);

                if (!existingFeed)
                    throw new Error("Couldn't find a feed with the given id");

                const updatedFeed: RSSFeedData = JSON.parse(body);
                // existingFeed.author = updatedFeed.author;
                existingFeed.title = updatedFeed.title;
                // existingFeed.url = updatedFeed.url;
                res.writeHead(200, {
                    "content-type": "application/json",
                });
                res.end(JSON.stringify(existingFeed));
            });
        });
    } catch (err: any) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify(err.toString()));
    }
};

export const deleteFeed = async (req: IncomingMessage, res: ServerResponse) => {
    const { url } = req;

    try {
        const id = url?.substring(url.lastIndexOf("/") + 1);
        if (id?.length === 0)
            throw new Error("Required parameter 'id' not found");

        const feedToDelete = data.find((feed) => feed.id === id);
        if (!feedToDelete)
            throw new Error("Couldn't find a feed with the given id");

        data.splice(data.indexOf(feedToDelete), 1);

        res.writeHead(204, { "content-type": "application/json" });
        res.end(JSON.stringify("RSS Feed deleted successfully"));
    } catch (err: any) {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify(err.toString()));
    }
};
