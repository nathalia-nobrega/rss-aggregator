import { randomUUID } from "crypto";
import http, { IncomingMessage, ServerResponse } from "http";
import { RSSFeedCreateRequest, RSSFeedData } from "./types/index.js";
import { extractFeed } from "./services/feed/feed.service.js";
import { routes } from "./lib/router.js";
import { URL } from "url";

// SETUP
const PORT = 8000;
const HOST = "localhost";

const server = http.createServer(
    (req: IncomingMessage, res: ServerResponse) => {
        const { url, method } = req;

        if (!url || !method) {
            return;
        }

        const corresponding = routes.find(
            (rt) => rt.method === method && rt.regex.test(url)
        );
    }
);

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
