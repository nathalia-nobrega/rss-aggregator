import { Server, ServerResponse } from "http";
import { JSON_CONTENT_TYPE } from "../constants/http.js";

export function sendJSON(res: ServerResponse, statusCode: number, data: any) {
    res.writeHead(statusCode, JSON_CONTENT_TYPE);
    res.end(JSON.stringify(data));
}

export function sendError(
    res: ServerResponse,
    statusCode: number,
    message: string
) {
    res.writeHead(statusCode, JSON_CONTENT_TYPE);
    res.end(JSON.stringify({ error: message }));
}

export function sendSuccessResponse(res: ServerResponse, data: any): void {
    return sendJSON(res, 200, data);
}

export function sendNoContentResponse(res: ServerResponse): void {
    return sendJSON(res, 204, "Resource deleted successfully");
}

export function sendCreatedResponse(res: ServerResponse, data: any): void {
    return sendJSON(res, 201, data);
}

export function sendBadRequestResponse(
    res: ServerResponse,
    message: string
): void {
    return sendError(res, 400, message);
}

export function sendNotFoundResponse(
    res: ServerResponse,
    message: string
): void {
    return sendError(res, 404, message);
}

export function sendConflictResponse(
    res: ServerResponse,
    message: string
): void {
    return sendError(res, 409, message);
}

export function sendTooManyRequestsResponseAndHeader(
    res: ServerResponse,
    resetTime: number
): void {
    res.writeHead(429, {
        "retry-after": Math.ceil((resetTime - Date.now()) / 1000).toString(),
    });
    res.end(JSON.stringify({ error: "Too many requests" }));
}

export function sendUnauthorizedResponse(
    res: ServerResponse,
    message: string
): void {
    return sendError(res, 401, message);
}

export function sendForbiddenResponse(
    res: ServerResponse,
    message: string
): void {
    return sendError(res, 403, message);
}
