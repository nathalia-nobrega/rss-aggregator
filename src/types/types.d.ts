import { IncomingMessage } from "http";

type Params = Record<string, string>;

export interface RouterIncomingMessage extends IncomingMessage {
    params: Params;
}

export type RSSFeedData = {
    id: string;
    title: string | undefined; // this can be changed by the user
    description: string | undefined;
    url: string | undefined;
    status: "active" | "paused"; // this can be changed by the user
    priority: "high" | "medium" | "low"; // this can be changed by the user
    // items: Array<RSSFeedItem>
};

export type RSSFeedCreateRequest = {
    feedUrl: string;
};
