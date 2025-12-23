import dotenv from "dotenv";
import http, { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { routes } from "./lib/router.js";
import { JSON_CONTENT_TYPE } from "./constants/http.js";
import { Params, RouterIncomingMessage } from "./types/http.js";

// SETUP
dotenv.config();

const PORT = Number(process.env.PORT) | 8000;
const HOST = "localhost";
const server = http.createServer(
    (req: IncomingMessage, res: ServerResponse) => {
        const { url, method } = req;

        if (!url || !method) {
            res.writeHead(400).end(JSON.stringify("Bad Request"));
            return;
        }

        const route = routes.find(
            (rt) => rt.method === method && rt.regex.test(url)
        );

        // handle if URL is present but method is wrong
        if (!route) {
            if (routes.find((rt) => rt.regex.test(url))) {
                res.writeHead(405, JSON_CONTENT_TYPE);
                res.end(
                    JSON.stringify(
                        "The target resource doesn't support this method"
                    )
                );
                return;
            }
            // handle if URL isn't present
            res.writeHead(404, JSON_CONTENT_TYPE);
            res.end(JSON.stringify("Cannot find the requested resource"));
            return;
        }

        // handle the request
        const match = route.regex.exec(url);

        const paramValues = match!.slice(1);
        const params: Params = {};

        route.pathParams.forEach((key, index) => {
            // the keys and values arrays should match in the order
            // e.g params['id'] = paramValues['123-24-afda-c']
            params[key] = paramValues[index]!;
        });
        const parsedReq = req as RouterIncomingMessage;
        parsedReq.params = params;
        route.handler(parsedReq, res);
    }
);

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
