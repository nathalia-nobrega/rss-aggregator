import { IncomingMessage, ServerResponse } from "http";
import { routes } from "../routes/router.js";
import { Params, RouterIncomingMessage } from "../types/http.js";
import {
    sendBadRequestResponse,
    sendError,
    sendNotFoundResponse,
} from "./response.js";

/**
 * Reads the complete request body from a stream
 * Returns a Promise that resolves with the body as a string
 */
export async function readRequestBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let body = "";

        req.setEncoding("utf-8");

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            resolve(body);
        });

        req.on("error", (err) => {
            reject(err);
        });
    });
}

export function findRoute(req: IncomingMessage, res: ServerResponse) {
    const { url, method } = req;

    if (!url || !method) {
        return sendBadRequestResponse(res, "Bad request");
    }

    const route = routes.find(
        (rt) => rt.method === method && rt.regex.test(url)
    );

    // handle if URL is present but method is wrong
    if (!route) {
        if (routes.find((rt) => rt.regex.test(url))) {
            return sendError(
                res,
                405,
                "The target resource doesn't support this method"
            );
        }
        return sendNotFoundResponse(res, "Cannot find the requested resource");
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
    return { route, parsedReq };
}
