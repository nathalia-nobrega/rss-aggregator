import { randomUUID } from "crypto";
import { ServerResponse } from "http";
import { extractFeed } from "../../services/feed/feed.service.js";
import { RSSFeedData } from "../../types/feed/models.js";
import {
    RSSFeedCreateRequest,
    UpdateFeedRequest,
} from "../../types/feed/requests.js";
import { normalizeUrl } from "../../types/feed/validators.js";
import { RouterIncomingMessage } from "../../types/http.js";
import {
    sendBadRequestResponse,
    sendConflictResponse,
    sendError,
    sendNoContentResponse,
    sendNotFoundResponse,
    sendSuccessResponse,
} from "../../utilities/response.js";

let feedTable: Array<RSSFeedData> = [];

// Note: In all of these handlers, I am assuming that url is not undefined since I already validate that in server.ts
// I know there are better ways to handle this and this could possible lead to errors in a more complex codebase,
// But for now I believe this is an okay thing to do.

export const getAllFeeds = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    return sendSuccessResponse(res, feedTable);
};

export const addNewFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const requestData = req.body as RSSFeedCreateRequest;

        const existingFeed = feedTable.find(
            (feed) =>
                normalizeUrl(feed.url) === normalizeUrl(requestData.feedUrl)
        );
        if (existingFeed) {
            return sendConflictResponse(
                res,
                "Feed with given URL already exists for this user"
            );
        }
        const extractedData = await extractFeed(requestData.feedUrl);
        const newFeed: RSSFeedData = {
            id: randomUUID(),
            ...extractedData,
            priority: "high",
            status: "active",
        };

        feedTable.push(newFeed);
        return sendSuccessResponse(res, newFeed);
    } catch (err: any) {
        return sendError(res, 500, err.toString());
    }
};

export const getFeedById = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const id = req.params["id"];

    const feedFound = feedTable.find((feed) => feed.id === id);

    if (!feedFound) {
        return sendNotFoundResponse(
            res,
            "Couldn't find a feed with the given id"
        );
    }
    return sendSuccessResponse(res, feedFound);
};
export const updateFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const id = req.params["id"];

        let existingFeed = feedTable.find((feed) => feed.id === id);

        if (!existingFeed) {
            return sendBadRequestResponse(
                res,
                "Couldn't find a feed with the given id"
            );
        }

        const feedUpdateData = req.body as UpdateFeedRequest;

        // Something very useful that I learned here:
        // Type assertions remove safety, they do not add it.
        if (feedUpdateData.feedStatus !== undefined)
            existingFeed.status = feedUpdateData.feedStatus;

        if (feedUpdateData.feedPriority !== undefined)
            existingFeed.priority = feedUpdateData.feedPriority;

        if (feedUpdateData.feedTitle !== undefined)
            existingFeed.title = feedUpdateData.feedTitle;

        return sendSuccessResponse(res, existingFeed);
    } catch (err: any) {
        return sendError(res, 500, err.toString());
    }
};

export const deleteFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const id = req.params["id"];

        const feedToDelete = feedTable.find((feed) => feed.id === id);
        if (!feedToDelete) {
            return sendNotFoundResponse(
                res,
                "No feed found with the given identifier"
            );
        }

        feedTable.splice(feedTable.indexOf(feedToDelete), 1);

        return sendNoContentResponse(res);
    } catch (err: any) {
        return sendError(res, 500, err.toString());
    }
};
