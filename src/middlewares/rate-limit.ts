import { ServerResponse } from "http";
import { Handler } from "../routes.js";
import { RouterIncomingMessage } from "../types/http.js";

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
// Keeping the rate limiting simple! I know the standard is to use something like Redis
const ipCache = new Map<string, { count: number; resetTime: number }>();

export const withRateLimit = (handler: Handler): Handler => {
    return (req: RouterIncomingMessage, res: ServerResponse) => {
        const ip = req.socket.remoteAddress || "unknown";
        const now = Date.now();
        const record = ipCache.get(ip);

        if (!record || now > record.resetTime) {
            // New window
            ipCache.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        } else if (record.count >= MAX_REQUESTS) {
            res.writeHead(429, {
                "retry-after": Math.ceil(
                    (record.resetTime - now) / 1000
                ).toString(),
            });
            res.end(JSON.stringify({ error: "Too many requests" }));
            return;
        } else {
            record.count++;
        }

        return handler(req, res);
    };
};
