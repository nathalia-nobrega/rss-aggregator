import {
    addNewFeed,
    deleteFeed,
    getAllFeedsHandler,
    getFeedById,
    updateFeed,
} from "../handlers/feed/feed.handler.js";
import { Handler, Method, Route } from "../routes.js";

export const routes: Route[] = [];

// Helper
const addRoute = (method: Method, url: string, handler: Handler) => {
    // Convert a url like "/feeds/:id" to Regex "/feeds/([^/]+)"
    const pattern = url.replace(/:[^\s/]+/g, "([^/]+)");
    const regex = new RegExp(`^${pattern}$`);

    routes.push({ method, url, handler, regex });
};

// Definitions
addRoute("GET", "/feeds", getAllFeedsHandler);
addRoute("POST", "/feeds", addNewFeed);
addRoute("GET", "/feeds/:id", getFeedById);
addRoute("PUT", "/feeds/:id", updateFeed);
addRoute("DELETE", "/feeds/:id", deleteFeed);
