import { IncomingMessage } from "http";

export type Params = Record<string, string>;

export interface RouterIncomingMessage extends IncomingMessage {
    params: Params;
    userId?: string;
}
