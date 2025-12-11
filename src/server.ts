import http, { IncomingMessage, ServerResponse } from "http";
import { routes } from "./lib/router.js";

// SETUP
const PORT = 8000;
const HOST = "localhost";

const server = http.createServer(
    (req: IncomingMessage, res: ServerResponse) => {
        const { url, method } = req;

        if (!url || !method) {
            return;
        }

        const route = routes.find(
            (rt) => rt.method === method && rt.regex.test(url)
        );

        // handle if URL is present but method is wrong
        if (!route) {
            if (routes.find((rt) => rt.regex.test(url))) {
                res.writeHead(405, { "content-type": "application/json" });
                res.end(
                    JSON.stringify(
                        "The target resource doesn't support this method"
                    )
                );
                return;
            }
            // handle if URL isn't present
            res.writeHead(404, { "content-type": "application/json" });
            res.end(JSON.stringify("Cannot find the requested resource"));
            return;
        }

        // handle the request
        route.handler(req, res);
    }
);

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
