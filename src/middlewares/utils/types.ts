import { ServerResponse } from "http";
import { RouterIncomingMessage } from "../../types/http.js";

export type Middleware = (
    req: RouterIncomingMessage,
    res: ServerResponse,
    next: NextFunction
) => void | Promise<void>;

export type NextFunction = () => void;
