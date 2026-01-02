import { sendError } from "../utilities/response.js";
import database from "./sqlite.js";

export const findArticleByFeedIdAndLink = database.prepare(
    `
    SELECT id, content_hash
    FROM articles
    WHERE feed_id = ? AND link = ?
    `
);

export const insertArticle = database.prepare(
    `
    INSERT INTO articles (
        id, 
        feed_id, 
        title, 
        link, 
        pub_date, 
        content_hash, 
        content,
        excerpt,
        created_at, 
        updated_at)
    VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, 
        unixepoch('now', 'localtime'), 
        unixepoch('now', 'localtime')
    )
    RETURNING id, feed_id, title, link, pub_date
    `
);

export const insertManyInTransaction = (
    rows: Array<{
        id: string;
        feed_id: string;
        title: string;
        link: string;
        pub_date: number;
        content_hash: string;
        content: string;
        excerpt: string;
    }>
) => {
    database.exec("BEGIN TRANSACTION");

    try {
        for (const row of rows) {
            insertArticle.run(
                row.id,
                row.feed_id,
                row.title,
                row.link,
                row.pub_date,
                row.content_hash,
                row.content,
                row.excerpt
            );
        }
        database.exec("COMMIT");
    } catch (err: any) {
        database.exec("ROLLBACK");
        throw err;
    }
};

// should the excerpt be updated too?
export const updateArticleById = database.prepare(
    `
    UPDATE articles
    SET
        title = ?,
        pub_date = ?,
        content_hash = ?,
        updated_at = unixepoch('now', 'localtime')
    WHERE id = ?
    RETURNING id, feed_id, title, link, pub_date
    `
);

// TODO: Find out more about this cursor pagination!!!!!!!
export const findAllArticlesByFeedId = database.prepare(
    `
    SELECT id, feed_id, title, link, pub_date, excerpt
    FROM articles
    WHERE feed_id = ?
    AND (
        ? IS NULL
        OR pub_date < ?
        OR (pub_date = ? AND id < ?)
      )
    ORDER BY pub_date DESC, id DESC
    LIMIT ?
    `
);

// decided to pass userId here bc otherwise i would need a whole other middleware
// for checking ownership really
export const findDetailedArticleByIdAndUserId = database.prepare(
    `
    SELECT
        a.id,
        a.feed_id,
        a.title,
        a.link,
        a.pub_date,
        a.content
    FROM articles a
    JOIN feeds f ON f.id = a.feed_id
    WHERE a.id = ?
        AND f.user_id = ?
    `
);
