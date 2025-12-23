import { ServerResponse } from "http";
import { JSON_CONTENT_TYPE } from "../constants/http.js";
import { Handler } from "../routes.js";
import { RouterIncomingMessage } from "../types/http.js";
import { extractToken, verifyToken } from "../utilities/jwt.js";
import jsonwebtoken from "jsonwebtoken";

//  Authentication middleware
export const withAuth = (handler: Handler): Handler => {
    return (req: RouterIncomingMessage, res: ServerResponse) => {
        const accessSecret = process.env.JWT_SECRET || "super_secret";

        const token = extractToken(req);
        if (token == null) {
            res.writeHead(401, JSON_CONTENT_TYPE);
            res.end(
                JSON.stringify({
                    error: "Missing or malformed Authorization header",
                })
            );
            return;
        }
        try {
            const decoded = verifyToken(token);
            req.userId = decoded.userId;

            // proceed to the actual handler
            return handler(req, res);
        } catch (err: any) {
            res.writeHead(403, JSON_CONTENT_TYPE);

            if (err instanceof jsonwebtoken.TokenExpiredError) {
                res.end(JSON.stringify({ error: "Token expired" }));
            } else if (err instanceof jsonwebtoken.JsonWebTokenError) {
                res.end(JSON.stringify({ error: "Invalid token" }));
            }

            return;
        }
    };
};
