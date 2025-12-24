import { randomUUID } from "crypto";
import { ServerResponse } from "http";
import { JSON_CONTENT_TYPE } from "../../constants/http.js";
import { InvalidJsonFormat } from "../../errors/InvalidJsonFormat.js";
import { MissingRequestBody } from "../../errors/MissingRequestBody.js";
import { extractFeed } from "../../services/feed/feed.service.js";
import { RSSFeedData } from "../../types/feed/models.js";
import {
    RSSFeedCreateRequest,
    UpdateFeedRequest,
} from "../../types/feed/requests.js";
import {
    isFeedPriority,
    isFeedStatus,
    isValidFeedUrl,
    normalizeUrl,
} from "../../types/feed/validators.js";
import { RouterIncomingMessage } from "../../types/http.js";
import { readJSON } from "../../utilities/request.js";
import { sendError } from "../../utilities/response.js";
import { isValidIdParam } from "../../utilities/validators.js";

let feedTable: Array<RSSFeedData> = [];

// Note: In all of these handlers, I am assuming that url is not undefined since I already validate that in server.ts
// I know there are better ways to handle this and this could possible lead to errors in a more complex codebase,
// But for now I believe this is an okay thing to do.

export const getAllFeeds = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    res.writeHead(200, JSON_CONTENT_TYPE);
    res.end(JSON.stringify(feedTable));
};

export const addNewFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const requestData = await readJSON<RSSFeedCreateRequest>(req);

        if (!isValidFeedUrl(requestData.feedUrl)) {
            sendError(
                res,
                400,
                "Invalid feed URL format. Expected .xml or .rss extension"
            );
            return;
        }

        const existingFeed = feedTable.find(
            (feed) =>
                normalizeUrl(feed.url) === normalizeUrl(requestData.feedUrl)
        );
        if (existingFeed) {
            sendError(
                res,
                409,
                "Feed with given URL already exists for this user"
            );
            return;
        }
        const extractedData = await extractFeed(requestData.feedUrl);
        const newFeed: RSSFeedData = {
            id: randomUUID(),
            ...extractedData,
            priority: "high",
            status: "active",
        };

        feedTable.push(newFeed);
        res.writeHead(201, JSON_CONTENT_TYPE);
        res.end(JSON.stringify(newFeed));
    } catch (err: any) {
        if (err instanceof InvalidJsonFormat) {
            return sendError(res, 400, err.message);
        }
        if (err instanceof MissingRequestBody) {
            return sendError(res, 400, err.message);
        }

        return sendError(res, 400, err.message);
    }
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

    const feedFound = feedTable.find((feed) => feed.id === id);

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

        let existingFeed = feedTable.find((feed) => feed.id === id);

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

        const feedToDelete = feedTable.find((feed) => feed.id === id);
        if (!feedToDelete)
            throw new Error("Couldn't find a feed with the given id");

        feedTable.splice(feedTable.indexOf(feedToDelete), 1);

        res.writeHead(204, JSON_CONTENT_TYPE);
        res.end(JSON.stringify("RSS Feed deleted successfully"));
    } catch (err: any) {
        res.writeHead(404, JSON_CONTENT_TYPE);
        res.end(JSON.stringify(err.toString()));
    }
};
