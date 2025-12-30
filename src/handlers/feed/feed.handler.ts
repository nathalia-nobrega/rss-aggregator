import { randomUUID } from "crypto";
import { ServerResponse } from "http";
import { extractFeed } from "../../services/feed/feed.service.js";
import { RSSFeedData, RSSFeedDataDB } from "../../types/feed/models.js";
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
import {
    allFeedsFromUserId,
    deleteFeedById,
    findFeedById,
    findFeedByUserIdAndNormalizedUrl,
    insertFeed,
    updateFeedById,
} from "../../db/queries.js";
import { entityToFeed } from "../../utilities/transformers.js";

// Note: In all of these handlers, I am assuming that url is not undefined since I already validate that in server.ts
// I know there are better ways to handle this and this could possible lead to errors in a more complex codebase,
// But for now I believe this is an okay thing to do.

export const getAllFeeds = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    return sendSuccessResponse(res, allFeedsFromUserId.all(req.userId!));
};

export const addNewFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const requestData = req.body as RSSFeedCreateRequest;

        const existingFeed = findFeedByUserIdAndNormalizedUrl.get(
            req.userId!,
            normalizeUrl(requestData.feedUrl)
        );
        if (existingFeed) {
            return sendConflictResponse(
                res,
                "Feed with given URL already exists for this user"
            );
        }
        const extractedData = await extractFeed(requestData.feedUrl);
        const record = insertFeed.get(
            randomUUID(),
            req.userId!,
            extractedData.url,
            normalizeUrl(extractedData.url),
            extractedData.title,
            extractedData.description,
            "active",
            "high"
        ) as RSSFeedDataDB;
        return sendSuccessResponse(res, entityToFeed(record));
    } catch (err: any) {
        return sendError(res, 500, err.toString());
    }
};

export const getFeedById = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const id = req.params["id"]!;

    const feedFound = findFeedById.get(id) as RSSFeedDataDB;

    if (!feedFound) {
        return sendNotFoundResponse(
            res,
            "Couldn't find a feed with the given id"
        );
    }
    return sendSuccessResponse(res, entityToFeed(feedFound));
};
export const updateFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const feedId = req.params["id"]!;

        let existingFeed = findFeedById.get(feedId) as RSSFeedDataDB;

        if (!existingFeed) {
            return sendBadRequestResponse(
                res,
                "Couldn't find a feed with the given id"
            );
        }

        const feedUpdateData = req.body as UpdateFeedRequest;
        const updates: Partial<UpdateFeedRequest> = {};

        // Something very useful that I learned here:
        // Type assertions remove safety, they do not add it.
        if (feedUpdateData.feedStatus !== undefined)
            updates.feedStatus = feedUpdateData.feedStatus;

        if (feedUpdateData.feedPriority !== undefined)
            updates.feedPriority = feedUpdateData.feedPriority;

        if (feedUpdateData.feedTitle !== undefined)
            updates.feedTitle = feedUpdateData.feedTitle;

        const updatedRecord = updateFeedById.get(
            feedUpdateData.feedTitle ?? null,
            feedUpdateData.feedStatus ?? null,
            feedUpdateData.feedPriority ?? null,
            existingFeed.id,
            req.userId!
        ) as RSSFeedDataDB;

        return sendSuccessResponse(res, entityToFeed(updatedRecord));
    } catch (err: any) {
        return sendError(res, 500, err.toString());
    }
};

export const deleteFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const feedId = req.params["id"]!;

        const feedToDelete = findFeedById.get(feedId) as RSSFeedDataDB;
        if (!feedToDelete) {
            return sendNotFoundResponse(
                res,
                "No feed found with the given identifier"
            );
        }

        deleteFeedById.get(feedToDelete.id);

        return sendNoContentResponse(res);
    } catch (err: any) {
        return sendError(res, 500, err.toString());
    }
};
