import { randomUUID } from "crypto";
import { IncomingMessage, ServerResponse } from "http";
import { extractFeed } from "../../services/feed/feed.service.js";
import {
    RouterIncomingMessage,
    RSSFeedCreateRequest,
    RSSFeedData,
    UpdateFeedRequest,
} from "../../types/types.js";

let data: Array<RSSFeedData> = [
    {
        id: randomUUID(),
        title: "Beej's Blog",
        description: "something",
        url: "https://beej.us/blog/rss.xml",
        status: "active",
        priority: "high",
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
    res.end(JSON.stringify(data));
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
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const { url } = req;

    try {
        const id = req.params["id"];
        if (id === undefined)
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
// problem 1: request body not being sent
export const updateFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const id = req.params["id"];

        if (id === undefined) {
            res.writeHead(400).end("Required parameter 'id' not found");
            return;
        }

        let existingFeed = data.find((feed) => feed.id === id);

        if (!existingFeed) {
            res.writeHead(404, { "content-type": "application/json" }).end(
                JSON.stringify("Couldn't find a feed with the given id")
            );
            return;
        }

        let body = "";

        req.setEncoding("utf-8");

        req.on("data", (chunk) => {
            body += chunk.toString();

            req.on("end", () => {
                // if json.parse throwns => send malformed body error
                const feedUpdateData: UpdateFeedRequest = JSON.parse(body);

                if (feedUpdateData.feedStatus !== undefined)
                    existingFeed.status = feedUpdateData.feedStatus;

                if (feedUpdateData.feedPriority !== undefined)
                    existingFeed.priority = feedUpdateData.feedPriority;

                if (feedUpdateData.feedTitle !== undefined)
                    existingFeed.title = feedUpdateData.feedTitle;

                res.writeHead(200, {
                    "content-type": "application/json",
                });
                res.end(JSON.stringify(existingFeed));
            });
            return;
        });
        // body wasn't sent
        // res.writeHead(400).end(JSON.stringify("Expected a request body."));
    } catch (err: any) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(
            JSON.stringify("Invalid JSON: request body could not be parsed.")
        );
    }
};

export const deleteFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const { url } = req;

    try {
        const id = req.params["id"];
        if (id === undefined)
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
