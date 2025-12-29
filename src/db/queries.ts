import database from "./sqlite.js";

export const insertFeed = database.prepare(`
    INSERT INTO feeds (id, user_id, url, normalized_url, title, description, status, priority, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch('now', 'localtime'), unixepoch('now', 'localtime'))
`);

export const allFeedsFromUserId = database.prepare(
    "SELECT * FROM feeds WHERE user_id = ?"
);
