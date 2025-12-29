/**
 * Ownership middleware (resource-aware and route-scoped).
 * This verification could be done in the handlers,
 * but since it's a simple enough logic and doesn't deal
 * with complex data/time constraints, I decided that
 * a middleware should be fine in this case.
 */

import { ServerResponse } from "http";
import { RouterIncomingMessage } from "../types/http.js";
import { Middleware, NextFunction } from "./utils/types.js";
import {
    sendForbiddenResponse,
    sendNotFoundResponse,
    sendUnauthorizedResponse,
} from "../utilities/response.js";
import { feedTable } from "../handlers/feed/feed.handler.js";

export const checkFeedOwnership: Middleware = async (
    req: RouterIncomingMessage,
    res: ServerResponse,
    next: NextFunction
) => {
    const reqUserId = req.userId;

    if (!reqUserId) {
        return sendUnauthorizedResponse(
            res,
            "Missing user's information in authorization headers"
        );
    }

    const feedParamId = req.params["id"];

    const feed = feedTable.find((feed) => feed.id === feedParamId);

    if (!feed) {
        return sendNotFoundResponse(res, "Feed not found");
    }

    if (feed.userId !== reqUserId) {
        return sendForbiddenResponse(
            res,
            "You do not have access to resources that you do not own"
        );
    }

    next();
};
