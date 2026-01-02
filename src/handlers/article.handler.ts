import { ServerResponse } from "http";
import { RouterIncomingMessage } from "../types/http.js";
import {
    fetchArticles,
    writeItemsToFile,
} from "../services/articles.service.js";
import { sendSuccessResponse } from "../utilities/response.js";
import { itemToArticleListItem } from "../utilities/transformers.js";

export const getAllArticlesFromFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const items = await fetchArticles(" https://sizeof.cat/index.xml", "XML");
    return sendSuccessResponse(
        res,
        items.map((it) => itemToArticleListItem(it))
    );
};

export const getArticleById = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {};
