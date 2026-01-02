import { DatabaseSync } from "node:sqlite";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const database = new DatabaseSync(`${__dirname}/database.db`);

const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at INTEGER NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users(email);
`;

const createFeeds = `
CREATE TABLE IF NOT EXISTS feeds (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

// TODO: FIND OUT WHY THE CONTENT IS HASHED
const createArticles = `
    CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        feed_id TEXT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        link TEXT NOT NULL,
        pub_date INTEGER NOT NULL,
        content_hash TEXT NOT NULL, -- title + content hash
        content TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );

    -- one row per article per feed
    CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_feed_link
    ON articles(feed_id, link);

    -- necessary for fetching the latest articles
    CREATE INDEX IF NOT EXISTS idx_articles_pub_date
    ON articles(feed_id, pub_date DESC, id DESC);
`;

database.exec("PRAGMA foreign_keys = ON");
database.exec(createUsers);
database.exec(createFeeds);
database.exec(createArticles);

export default database;
