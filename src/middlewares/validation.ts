import { IncomingMessage, ServerResponse } from "http";
import { InvalidJsonFormat } from "../errors/InvalidJsonFormat.js";
import { MissingRequestBody } from "../errors/MissingRequestBody.js";
import { RouterIncomingMessage } from "../types/http.js";
import { Middleware, NextFunction } from "./utils/types.js";
import { sendBadRequestResponse, sendError } from "../utilities/response.js";
import { isValidIdParam } from "../utilities/validators.js";
import {
    isFeedPriority,
    isFeedStatus,
    isValidFeedUrl,
} from "../types/feed/validators.js";
import {
    RSSFeedCreateRequest,
    UpdateFeedRequest,
} from "../types/feed/requests.js";
import { readRequestBody } from "../utilities/request.js";
import { RegisterUserRequest } from "../types/user/requests.js";
import { isValidEmail } from "../types/user/validators.js";

export const readAndParseBody: Middleware = async (
    req: RouterIncomingMessage,
    res: ServerResponse,
    next: NextFunction
) => {
    const body = await readRequestBody(req);

    if (body.length === 0) {
        return sendBadRequestResponse(res, "Request body is required");
    }

    try {
        const parsedBody = JSON.parse(body);
        req.body = parsedBody;
        next();
    } catch (err) {
        return sendBadRequestResponse(res, "Invalid JSON in request body");
    }
};

export function validateParams(paramNames: string[]): Middleware {
    return (
        req: RouterIncomingMessage,
        res: ServerResponse,
        next: NextFunction
    ) => {
        for (const paramName of paramNames) {
            const value = req.params[paramName];

            if (value === undefined) {
                return sendBadRequestResponse(
                    res,
                    `Required parameter '${paramName}' not found`
                );
            }

            if (paramName === "id" && !isValidIdParam(value)) {
                return sendBadRequestResponse(
                    res,
                    `Parameter '${paramName}' is not a valid ID`
                );
            }
        }

        next();
    };
}

export const validateCreateFeedBody: Middleware = (
    req: RouterIncomingMessage,
    res: ServerResponse,
    next: NextFunction
) => {
    const body = req.body as RSSFeedCreateRequest;

    if (!body.feedUrl) {
        return sendError(res, 400, "feedUrl is required");
    }

    if (!isValidFeedUrl(body.feedUrl)) {
        return sendBadRequestResponse(
            res,
            "Invalid feed URL format. Expected .xml or .rss extension"
        );
    }

    next();
};

export const validateUpdateFeedBody: Middleware = async (
    req: RouterIncomingMessage,
    res: ServerResponse,
    next: NextFunction
) => {
    const body = req.body as UpdateFeedRequest;

    if (body.feedStatus !== undefined && !isFeedStatus(body.feedStatus)) {
        return sendError(res, 400, "Invalid feedStatus value");
    }
    if (body.feedPriority !== undefined && !isFeedPriority(body.feedPriority)) {
        return sendError(res, 400, "Invalid feedPriority value");
    }

    next();
};

export const validateRegisterUserBody: Middleware = async (
    req: RouterIncomingMessage,
    res: ServerResponse,
    next: NextFunction
) => {
    const body = req.body as RegisterUserRequest;

    if (body.email === undefined || !isValidEmail(body.email)) {
        return sendBadRequestResponse(res, "The given e-mail is not valid");
    }
    next();
};
