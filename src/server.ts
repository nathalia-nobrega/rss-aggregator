import dotenv from "dotenv";
import http, { IncomingMessage, ServerResponse } from "http";
import { syncAllFeeds } from "./services/sync.service.js";
import { findRoute } from "./utilities/request.js";

// SETUP
dotenv.config();

const PORT = Number(process.env.PORT) | 8000;
const HOST = "localhost";
const SYNC_INTERVAL_MS =
    Number(process.env.SYNC_INTERVAL_MINUTES ?? 30) * 60 * 1000;

const server = http.createServer(
    (req: IncomingMessage, res: ServerResponse) => {
        const result = findRoute(req, res);
        if (!result) return;

        // execute route handler
        const { route, parsedReq } = result;
        route.handler(parsedReq, res);
    }
);

// polling engine!!!!!!
setInterval(() => {
    syncAllFeeds().catch((e) => console.error("[sync] Interval error", e));
}, SYNC_INTERVAL_MS);
console.log("[sync] Poller started.");

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
