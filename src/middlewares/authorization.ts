/**
 * Ownership middleware (resource-aware and route-scoped).
 * This verification could be done in the handlers,
 * but since it's a simple enough logic and doesn't deal
 * with complex data/time constraints, I decided that
 * a middleware should be fine in this case.
 */

import { ServerResponse } from "http";
import { findFeedById } from "../db/queries.js";
import { RouterIncomingMessage } from "../types/http.js";
import {
    sendForbiddenResponse,
    sendNotFoundResponse,
    sendUnauthorizedResponse,
} from "../utilities/response.js";
import { Middleware, NextFunction } from "./utils/types.js";

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

    const feedParamId = req.params["id"]!;

    const feedRecord = findFeedById.get(feedParamId);

    if (!feedRecord) {
        return sendNotFoundResponse(res, "Feed not found");
    }

    if (feedRecord.user_id !== reqUserId) {
        return sendForbiddenResponse(
            res,
            "You do not have access to resources that you do not own"
        );
    }

    next();
};
