import { IncomingMessage, OutgoingHttpHeaders } from "http";
import jsonwebtoken from "jsonwebtoken";

// TODO: Understand and find a better folder structure for these types

export type Params = Record<string, string>;

export const JSON_CONTENT_TYPE: Partial<OutgoingHttpHeaders> = {
    "content-type": "application/json",
};

export interface RouterIncomingMessage extends IncomingMessage {
    params: Params;
}

export type RSSFeedCreateRequest = {
    feedUrl: string;
};

export type RegisterUserRequest = {
    username: string;
    email: string;
    password: string;
};

export type FeedStatus = "active" | "paused";

export type FeedPriority = "high" | "medium" | "low";

export type UpdateFeedRequest = {
    feedStatus: FeedStatus;
    feedPriority: FeedPriority;
    feedTitle: string;
};

// type guard -> runtime code

export const FEED_STATUSES = ["active", "paused"] as const;
export const FEED_PRIORITIES = ["high", "medium", "low"] as const;

export function isFeedStatus(value: unknown): value is FeedStatus {
    return (
        typeof value === "string" && FEED_STATUSES.includes(value as FeedStatus)
    );
}

export function isFeedPriority(value: unknown): value is FeedPriority {
    return (
        typeof value === "string" &&
        FEED_PRIORITIES.includes(value as FeedPriority)
    );
}

export function isValidIdParam(id: string) {
    const uuidPattern =
        /^[0-9A-Fa-f]{8}(?:-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}$/gm;
    return uuidPattern.test(id);
}

export function isValidFeedUrl(url: string) {
    const feedUrlPattern = /https?:\/\/[^\/]+\/.*?\.(rss|xml)(\?.*)?$/i;
    return feedUrlPattern.test(url);
}

// Data that comes from RSS parser library (partial)
export interface ExtractedFeedData {
    title: string;
    description: string;
    url: string;
}

// Data that the parser extracts + my domain fields
// https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections
export interface RSSFeedData extends ExtractedFeedData {
    id: string;
    status: FeedStatus;
    priority: FeedPriority;
    // items: Array<RSSFeedItem>
}

export type User = {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    password: string;
};

export type UserDataResponse = {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    // show feeds maybe?
};

// https://stackoverflow.com/a/201378/22063652
export function isValidEmail(email: string) {
    const emailPattern =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailPattern.test(email);
}

// Generate JWT token
export function generateAccessToken(user: User) {
    const accessTokenPayload = {
        id: user.id,
        email: user.email,
    };

    const accessSecret = process.env.JWT_SECRET || "super_secret";
    return jsonwebtoken.sign(accessTokenPayload, accessSecret, {
        expiresIn: "24h",
    });
}

// TODO: Authentication middleware

// TODO: Implement refresh token
