import { ServerResponse } from "http";
import jsonwebtoken from "jsonwebtoken";
import { JSON_CONTENT_TYPE } from "../constants/http.js";
import { RouterIncomingMessage } from "../types/http.js";
import { extractToken, verifyToken } from "../utilities/jwt.js";
import { Middleware, NextFunction } from "./utils/types.js";
import { sendUnauthorizedResponse } from "../utilities/response.js";

//  Authentication middleware
export const withAuth: Middleware = async (
    req: RouterIncomingMessage,
    res: ServerResponse,
    next: NextFunction
) => {
    const token = extractToken(req);
    if (token == null) {
        return sendUnauthorizedResponse(
            res,
            "Missing or malformed Authorization header"
        );
    }
    try {
        const decoded = verifyToken(token);
        req.userId = decoded.userId;

        next();
    } catch (err: any) {
        // FIX THIS!!!!!
        res.writeHead(403, JSON_CONTENT_TYPE);

        if (err instanceof jsonwebtoken.TokenExpiredError) {
            res.end(JSON.stringify({ error: "Token expired" }));
        } else if (err instanceof jsonwebtoken.JsonWebTokenError) {
            res.end(JSON.stringify({ error: "Invalid token" }));
        }

        return;
    }
};
