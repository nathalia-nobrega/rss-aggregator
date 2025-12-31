import database from "./sqlite.js";

export const insertUser = database.prepare(
    `INSERT INTO users (id, email, username, password, created_at)
    VALUES (?, ?, ?, ?, unixepoch('now', 'localtime'))
    RETURNING id, email, username, created_at`
);

export const findUserByEmail = database.prepare(
    "SELECT u.* FROM users u WHERE u.email = ? "
);

export const existsByEmail = database.prepare(
    "SELECT EXISTS (SELECT 1 FROM users WHERE email = ?) AS email_already_registered;"
);

// SHOULD BE REMOVED LATER
export const findAllUsers = database.prepare("SELECT * FROM users;");
