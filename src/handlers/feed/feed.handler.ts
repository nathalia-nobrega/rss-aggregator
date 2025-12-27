import { randomUUID } from "crypto";
import { ServerResponse } from "http";
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
import {
    sendBadRequestResponse,
    sendConflictResponse,
    sendNoContentResponse,
    sendNotFoundResponse,
    sendSuccessResponse,
} from "../../utilities/response.js";
import { isValidIdParam } from "../../utilities/validators.js";

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
        const requestData = await readJSON<RSSFeedCreateRequest>(req);

        if (!isValidFeedUrl(requestData.feedUrl)) {
            return sendBadRequestResponse(
                res,
                "Invalid feed URL format. Expected .xml or .rss extension"
            );
        }

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
        if (err instanceof InvalidJsonFormat) {
            return sendBadRequestResponse(res, err.message);
        }
        if (err instanceof MissingRequestBody) {
            return sendBadRequestResponse(res, err.message);
        }

        return sendBadRequestResponse(res, err.message);
    }
};

export const getFeedById = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const id = req.params["id"];

    if (id === undefined || !isValidIdParam(id)) {
        return sendBadRequestResponse(
            res,
            "Required parameter 'id' not found or not valid"
        );
    }

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

        // Won't get here because route matching doesn't reach the endpoint if id isn't present
        // But it's nice to have it here just for the sake of learning
        if (id === undefined) {
            return sendBadRequestResponse(
                res,
                "Required parameter 'id' not found"
            );
        }

        let existingFeed = feedTable.find((feed) => feed.id === id);

        if (!existingFeed) {
            return sendBadRequestResponse(
                res,
                "Couldn't find a feed with the given id"
            );
        }

        // if json.parse throwns => send malformed body error
        const feedUpdateData = await readJSON<UpdateFeedRequest>(req);

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

        return sendSuccessResponse(res, existingFeed);
    } catch (err: any) {
        if (err instanceof InvalidJsonFormat) {
            return sendBadRequestResponse(res, err.message);
        }
        if (err instanceof MissingRequestBody) {
            return sendBadRequestResponse(res, err.message);
        }

        return sendBadRequestResponse(res, err.message);
    }
};

export const deleteFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const id = req.params["id"];
        if (id === undefined) {
            return sendBadRequestResponse(
                res,
                "Required parameter 'id' not found"
            );
        }

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
        return sendBadRequestResponse(res, err.toString());
    }
};
