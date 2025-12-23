import { randomUUID } from "crypto";
import { IncomingMessage, ServerResponse } from "http";
import { extractFeed } from "../../services/feed/feed.service.js";
import {
    isFeedPriority,
    isFeedStatus,
    isValidFeedUrl,
    isValidIdParam,
    RouterIncomingMessage,
    JSON_CONTENT_TYPE,
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

export const getAllFeeds = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    res.writeHead(200, JSON_CONTENT_TYPE);
    res.end(JSON.stringify(data));
};

export const addNewFeed = async (req: IncomingMessage, res: ServerResponse) => {
    let body = "";

    req.setEncoding("utf-8");

    req.on("data", (chunk) => {
        // this event fires asynchronously for each chunk
        body += chunk.toString();
    });

    req.on("end", async () => {
        // i learned something here:
        // this if statement was written before this 'end' event,
        // which means that it got executed immediately,
        // and the condition would've always been true
        // because the 'data' event runs in asynchronous mode
        // so this error would always happen regardless of any body being sent
        if (body.length === 0) {
            // body wasn't sent
            res.writeHead(400).end(JSON.stringify("Expected a request body."));
            return;
        }

        try {
            const newFeedLink: RSSFeedCreateRequest = JSON.parse(body);

            if (!isValidFeedUrl(newFeedLink.feedUrl)) {
                res.writeHead(400, JSON_CONTENT_TYPE);
                res.end(
                    JSON.stringify(
                        "Invalid feed URL format. Expected .xml or .rss extension"
                    )
                );

                return;
            }
            // The system must prevent a user from adding the exact same Feed URL twice.
            // If the feed already exists for this user_id, return 409 Conflict.
            const existingFeed = data.find(
                (feed) => feed.url === newFeedLink.feedUrl
            );
            if (existingFeed) {
                res.writeHead(409, JSON_CONTENT_TYPE);
                res.end(
                    JSON.stringify(
                        "Error: feed with given URL already exists for this user"
                    )
                );

                return;
            }
            const extractedData = await extractFeed(newFeedLink.feedUrl);

            const newFeed: RSSFeedData = {
                id: randomUUID(),
                ...extractedData,
                priority: "high",
                status: "active",
            };
            data.push(newFeed);
            res.writeHead(201, JSON_CONTENT_TYPE);
            res.end(JSON.stringify(newFeed));
        } catch (err: any) {
            res.writeHead(400, JSON_CONTENT_TYPE);
            res.end(
                JSON.stringify(
                    "Error reading the request body: " + err.toString()
                )
            );
        }
    });
};

export const getFeedById = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const id = req.params["id"];

    if (id === undefined || !isValidIdParam(id)) {
        res.writeHead(400, JSON_CONTENT_TYPE);
        res.end(
            JSON.stringify("Required parameter 'id' not found or not valid")
        );
    }

    const feedFound = data.find((feed) => feed.id === id);

    if (!feedFound) {
        res.writeHead(404, JSON_CONTENT_TYPE);
        res.end(JSON.stringify("Couldn't find a feed with the given id"));
    }

    res.writeHead(200, JSON_CONTENT_TYPE);
    res.end(JSON.stringify(feedFound));
};
export const updateFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const id = req.params["id"];

        // Won't get here because route matching doesn't reach the endpoint if id isn't present
        // But it's nice to have it here just for the sake of learning
        if (id === undefined) {
            res.writeHead(400).end("Required parameter 'id' not found");
            return;
        }

        let existingFeed = data.find((feed) => feed.id === id);

        if (!existingFeed) {
            res.writeHead(404, JSON_CONTENT_TYPE).end(
                JSON.stringify("Couldn't find a feed with the given id")
            );
            return;
        }

        let body = "";

        req.setEncoding("utf-8");

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            if (body.length === 0) {
                // body wasn't sent
                res.writeHead(400).end(
                    JSON.stringify("Expected a request body.")
                );
                return;
            }
            // if json.parse throwns => send malformed body error
            const feedUpdateData: UpdateFeedRequest = JSON.parse(body);

            // Something very useful that I learned here:
            // Type assertions remove safety, they do not add it.
            if (
                feedUpdateData.feedStatus !== undefined &&
                isFeedStatus(feedUpdateData.feedStatus)
            )
                existingFeed.status = feedUpdateData.feedStatus;

            if (
                feedUpdateData.feedPriority !== undefined &&
                isFeedPriority(feedUpdateData.feedPriority)
            )
                existingFeed.priority = feedUpdateData.feedPriority;

            if (feedUpdateData.feedTitle !== undefined)
                existingFeed.title = feedUpdateData.feedTitle;

            res.writeHead(200, {
                "content-type": "application/json",
            });
            res.end(JSON.stringify(existingFeed));
            return;
        });
    } catch (err: any) {
        res.writeHead(400, JSON_CONTENT_TYPE);
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

        res.writeHead(204, JSON_CONTENT_TYPE);
        res.end(JSON.stringify("RSS Feed deleted successfully"));
    } catch (err: any) {
        res.writeHead(404, JSON_CONTENT_TYPE);
        res.end(JSON.stringify(err.toString()));
    }
};
