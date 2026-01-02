import { ServerResponse } from "http";
import { RouterIncomingMessage } from "../types/http.js";
import {
    ArticleDetailedEntity,
    ArticleListItemEntity,
} from "../types/article/models.js";
import {
    findAllArticlesByFeedId,
    findDetailedArticleByIdAndUserId,
} from "../db/article.queries.js";
import {
    sendNotFoundResponse,
    sendSuccessResponse,
} from "../utilities/response.js";
import {
    entityToArticleListItem,
    entityToDetailedArticle,
} from "../utilities/transformers.js";

export const getAllArticlesFromFeed = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const articles = findAllArticlesByFeedId.all(
        req.params["id"]!,
        null,
        null,
        null,
        null,
        20
    ) as ArticleListItemEntity[];

    const list = articles.map((art) => entityToArticleListItem(art));
    return sendSuccessResponse(res, list);
};

export const getArticleById = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const artId = req.params["id"]!;
    const userId = req.userId!;
    const article = findDetailedArticleByIdAndUserId.get(
        artId,
        userId
    ) as ArticleDetailedEntity;

    if (!article) {
        return sendNotFoundResponse(res, "Article not found");
    }

    return sendSuccessResponse(res, entityToDetailedArticle(article));
};
