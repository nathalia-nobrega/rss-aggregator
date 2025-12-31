import database from "./sqlite.js";

export const findArticleByFeedIdAndUrl = database.prepare(
    `
    SELECT id, content_hash
    FROM articles
    WHERE feed_id = ? AND url = ?
    `
);

export const insertArticle = database.prepare(
    `
    INSERT INTO articles (
        id, 
        feed_id, 
        title, 
        url, 
        pub_date, 
        content_hash, 
        created_at, 
        updated_at)
    VALUES (
        ?, ?, ?, ?, ?, ?, 
        unixepoch('now', 'localtime'), 
        unixepoch('now', 'localtime')
    )
    RETURNING id, feed_id, title, url, pub_date
    `
);

export const updateArticleById = database.prepare(
    `
    UPDATE articles
    SET
        title = ?,
        pub_date = ?,
        content_hash = ?,
        updated_at = unixepoch('now', 'localtime')
    WHERE id = ?
    RETURNING id, feed_id, title, url, pub_date
    `
);

// TODO: Find out more about this cursor pagination!!!!!!!
export const findAllArticlesByFeedId = database.prepare(
    `
    SELECT id, feed_id, title, url, pub_date
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
        a.url,
        a.pub_date,
        a.content_hash,
        a.created_at,
        a.updated_at
    FROM articles a
    JOIN feeds f ON f.id = a.feed_id
    WHERE a.id = ?
        AND f.user_id = ?
    `
);
