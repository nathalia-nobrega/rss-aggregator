import {
    getAllFeeds,
    addNewFeed,
    getFeedById,
    updateFeed,
    deleteFeed,
} from "../handlers/feed/feed.handler.js";
import {
    registerUser,
    login,
    getAllUsers,
} from "../handlers/user/user.handler.js";
import { withAuth } from "../middlewares/authentication.js";
import { checkFeedOwnership } from "../middlewares/authorization.js";
import { withRateLimit } from "../middlewares/rate-limit.js";
import { runMiddlewares } from "../middlewares/utils/runner.js";
import {
    validateCreateFeedBody,
    validateUpdateFeedBody,
    validateRegisterUserBody,
    readAndParseBody,
} from "../middlewares/validation.js";
import { resetDatabase } from "../handlers/test/reset.handler.js";
import { Handler, Method, Route } from "./types.js";

export const routes: Route[] = [];

// --- Regex Logic ---

/**
 * Converts a path pattern like "/feeds/:id" into a RegExp and extracts parameter names.
 */
const pathToRegex = (path: string): { regex: RegExp; keys: string[] } => {
    const paramKeys: string[] = [];

    // 1. Escape special regex characters
    let regexPath = path.replace(/([.+*?^${}()|[\]\\])/g, "\\$1");

    // 2. Find and replace parameters (e.g., :id) with the capture group ([^/]+)
    // The capture group (paramName) is used to track the names
    regexPath = regexPath.replace(/:([a-zA-Z0-9_]+)/g, (match, paramKey) => {
        paramKeys.push(paramKey);
        // Replace with the capture group: one or more characters that are NOT a forward slash
        return "([^/]+)";
    });

    // 3. Compile the final RegExp with start (^) and end ($) anchors
    const regex = new RegExp(`^${regexPath}$`);

    return { regex, keys: paramKeys };
};
// --- Public Registration Function ---

/**
 * Registers a new route in the registry, compiling the regex pattern.
 */
export const addRoute = (method: Method, pattern: string, handler: Handler) => {
    const { regex, keys: names } = pathToRegex(pattern);

    routes.push({
        url: pattern,
        method,
        handler,
        regex,
        pathParams: names,
    });
};

addRoute(
    "GET",
    "/feeds",
    runMiddlewares([withRateLimit, withAuth], getAllFeeds)
);

addRoute(
    "POST",
    "/feeds",
    runMiddlewares(
        [withRateLimit, withAuth, readAndParseBody, validateCreateFeedBody],
        addNewFeed
    )
);

addRoute(
    "GET",
    "/feeds/:id",
    runMiddlewares([withRateLimit, withAuth, checkFeedOwnership], getFeedById)
);

addRoute(
    "PATCH",
    "/feeds/:id",
    runMiddlewares(
        [
            withRateLimit,
            withAuth,
            checkFeedOwnership,
            readAndParseBody,
            validateUpdateFeedBody,
        ],
        updateFeed
    )
);

addRoute(
    "DELETE",
    "/feeds/:id",
    runMiddlewares([withRateLimit, withAuth, checkFeedOwnership], deleteFeed)
);

addRoute(
    "POST",
    "/auth/register",
    runMiddlewares(
        [withRateLimit, readAndParseBody, validateRegisterUserBody],
        registerUser
    )
);

addRoute(
    "POST",
    "/auth/login",
    runMiddlewares([withRateLimit, readAndParseBody], login)
);

addRoute("GET", "/users", runMiddlewares([], getAllUsers));

addRoute(
    "POST",
    "/__test__/reset",
    runMiddlewares([withRateLimit], resetDatabase)
);
