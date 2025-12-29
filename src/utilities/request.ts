import { IncomingMessage } from "http";

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
