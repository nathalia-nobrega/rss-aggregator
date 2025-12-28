import { ServerResponse } from "http";
import { Handler } from "../../routes.js";
import { RouterIncomingMessage } from "../../types/http.js";
import { sendError } from "../../utilities/response.js";
import { Middleware } from "./types.js";

export function runMiddleware(
    middlewares: Array<Middleware>,
    handler: Handler
): Handler {
    return async (req: RouterIncomingMessage, res: ServerResponse) => {
        let currIndex = 0;

        const next = async (): Promise<void> => {
            if (currIndex >= middlewares.length) {
                return await handler(req, res);
            }

            const currMiddleware = middlewares[currIndex]!;

            currIndex++;

            await currMiddleware(req, res, next);
        };

        try {
            await next();
        } catch (err: any) {
            if (!res.headersSent) {
                return sendError(
                    res,
                    500,
                    err.message || "Internal server error"
                );
            }
        }
    };
}
