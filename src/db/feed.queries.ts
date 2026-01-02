import database from "./sqlite.js";

export const allFeedsFromUserId = database.prepare(
    "SELECT * FROM feeds WHERE user_id = ?"
);

export const insertFeed = database.prepare(`
    INSERT INTO feeds (id, user_id, url, normalized_url, title, description, status, priority, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch('now', 'localtime'), unixepoch('now', 'localtime'))
    RETURNING id, url, title, description, status, priority
`);

export const findFeedById = database.prepare(
    "SELECT * FROM feeds WHERE id = ?"
);

export const findFeedByUserIdAndNormalizedUrl = database.prepare(
    "SELECT * FROM feeds WHERE user_id = ? AND normalized_url = ?"
);

export const updateFeedById = database.prepare(`
    UPDATE feeds
    SET
        title = COALESCE(?, title),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority)
    WHERE id = ? AND user_id = ?
    RETURNING id, url, title, description, status, priority
`);

export const deleteFeedById = database.prepare(
    "DELETE FROM feeds WHERE id = ?"
);

/**
 * Queries for the polling engine
 */

export const findAllActiveFeeds = database.prepare(
    `
    SELECT * 
    FROM feeds 
    WHERE status = 'active'
    ORDER BY 
        CASE priority
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            ELSE 3
        END,
        priority ASC, 
        last_fetched ASC;
    `
);

export const markFeedAsSuccessful = database.prepare(
    `
        UPDATE feeds
        SET 
            last_fetched = unixepoch('now', 'localtime'),
            error_count = 0
        WHERE id = ?
    `
);

export const markFeedAsErrored = database.prepare(
    `
        UPDATE feeds
        SET
            error_count += 1,
            status = CASE 
                WHEN error_count = 5 THEN 'paused'
            END
        WHERE id = ?
    `
);
