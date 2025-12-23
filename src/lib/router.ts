import {
    addNewFeed,
    deleteFeed,
    getAllFeedsHandler,
    getFeedById,
    updateFeed,
} from "../handlers/feed/feed.handler.js";
import { registerUser } from "../handlers/user/user.handler.js";
import { Handler, Method, Route } from "../routes.js";

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

// Definitions
addRoute("GET", "/feeds", getAllFeedsHandler);
addRoute("POST", "/feeds", addNewFeed);
addRoute("GET", "/feeds/:id", getFeedById);
addRoute("PUT", "/feeds/:id", updateFeed);
addRoute("DELETE", "/feeds/:id", deleteFeed);

addRoute("POST", "/users", registerUser);
