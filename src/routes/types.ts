import { ServerResponse } from "http";
import { RouterIncomingMessage } from "../types/http.js";

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type Handler = (req: RouterIncomingMessage, res: ServerResponse) => void;

export interface Route {
    method: Method;
    handler: Handler;
    url: string;
    // We compile the regex once, ahead of time, for performance!
    regex: RegExp;
    pathParams: string[];
}
