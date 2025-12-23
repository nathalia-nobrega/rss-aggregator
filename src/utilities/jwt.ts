import { RouterIncomingMessage } from "../types/http.js";
import { User } from "../types/user/models.js";
import jsonwebtoken from "jsonwebtoken";

/**
 * Generates JWT access token for user
 */
export function generateAccessToken(user: User) {
    const accessTokenPayload = {
        userId: user.id,
        email: user.email,
    };

    const accessSecret = process.env.JWT_SECRET || "super_secret";
    return jsonwebtoken.sign(accessTokenPayload, accessSecret, {
        expiresIn: "24h",
    });
}

/**
 * Extracts JWT token from Authorization header
 */
export function extractToken(req: RouterIncomingMessage): string | null {
    const token = req.headers["authorization"];
    if (!token) {
        return null;
    }

    if (token.startsWith("Bearer ")) {
        return token.substring(7);
    }

    return token;
}

/**
 * Verifies JWT token and returns decoded payload
 */
export function verifyToken(token: string): { userId: string } {
    const accessSecret = process.env.JWT_SECRET || "super_secret";
    return jsonwebtoken.verify(token, accessSecret) as { userId: string };
}

// TODO: Implement refresh token
