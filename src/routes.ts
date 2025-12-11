import { IncomingMessage, ServerResponse } from "http";

export type Method = "GET" | "POST" | "PUT" | "DELETE";
export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

export interface Route {
    method: Method;
    handler: Handler;
    url: string;
    // We compile the regex once, ahead of time, for performance!
    regex: RegExp;
}
