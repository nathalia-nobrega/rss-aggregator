import { ServerResponse } from "http";
import { JSON_CONTENT_TYPE } from "../constants/http.js";

/**
 * Sends a JSON response with the given status code and data
 */
export function sendJSON(res: ServerResponse, statusCode: number, data: any) {
    res.writeHead(statusCode, JSON_CONTENT_TYPE);
    res.end(JSON.stringify(data));
}

/**
 * Sends an error response with the given status code and message
 */
export function sendError(
    res: ServerResponse,
    statusCode: number,
    message: string
) {
    res.writeHead(statusCode, JSON_CONTENT_TYPE);
    res.end(JSON.stringify({ error: message }));
}

/**
 * Sends a success response (200) with data
 */
export function sendSuccessResponse(res: ServerResponse, data: any): void {
    return sendJSON(res, 200, data);
}

/**
 * Sends a created response (201) with data
 */
export function sendCreatedResponse(res: ServerResponse, data: any): void {
    return sendJSON(res, 201, data);
}

/**
 * Sends a bad request error response (400)
 */
export function sendBadRequestResponse(
    res: ServerResponse,
    message: string
): void {
    return sendError(res, 400, message);
}

/**
 * Sends a not found error response (404)
 */
export function sendNotFoundResponse(
    res: ServerResponse,
    message: string
): void {
    return sendError(res, 404, message);
}
