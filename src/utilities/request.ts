import { IncomingMessage } from "http";
import { MissingRequestBody } from "../errors/MissingRequestBody.js";
import { InvalidJsonFormat } from "../errors/InvalidJsonFormat.js";

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

/**
 * Reads and parses JSON from request body
 * Throws an error if JSON is invalid
 */
export async function readJSON<T = any>(req: IncomingMessage): Promise<T> {
    const body = await readRequestBody(req);

    if (body.length === 0) {
        throw new MissingRequestBody("Request body is required");
    }

    try {
        return JSON.parse(body) as T;
    } catch (err) {
        throw new InvalidJsonFormat("Invalid JSON in request body");
    }
}
