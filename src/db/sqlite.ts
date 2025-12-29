import { DatabaseSync } from "node:sqlite";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const database = new DatabaseSync(`${__dirname}/database.db`);

const initDb = `
CREATE TABLE IF NOT EXISTS feeds (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        url TEXT NOT NULL,
        normalized_url TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'paused')),
        priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
        last_fetched INTEGER,
        error_count INTEGER NOT NULL DEFAULT 0,
        created_at  INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_feeds_user_norm_url
    ON feeds(user_id, normalized_url);

    -- Poller engine will be querying feeds with status = active and priority = high
    CREATE INDEX IF NOT EXISTS idx_feeds_status_priority
    ON feeds(status, priority);
`;

database.exec(initDb);

export default database;
