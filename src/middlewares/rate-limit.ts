import { ServerResponse } from "http";
import { RouterIncomingMessage } from "../types/http.js";
import {
    sendError,
    sendTooManyRequestsResponseAndHeader,
} from "../utilities/response.js";
import { Middleware, NextFunction } from "./utils/types.js";

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
// Keeping the rate limiting simple! I know the standard is to use something like Redis
const ipCache = new Map<string, { count: number; resetTime: number }>();

export const withRateLimit: Middleware = async (
    req: RouterIncomingMessage,
    res: ServerResponse,
    next: NextFunction
) => {
    const ip = req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const record = ipCache.get(ip);

    if (!record || now > record.resetTime) {
        // New window
        ipCache.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    } else if (record.count >= MAX_REQUESTS) {
        return sendTooManyRequestsResponseAndHeader(res, record.resetTime);
    } else {
        record.count++;
    }
    next();
};
