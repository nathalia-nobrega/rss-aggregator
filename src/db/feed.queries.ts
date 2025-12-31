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
