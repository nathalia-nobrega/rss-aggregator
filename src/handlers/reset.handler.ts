import { ServerResponse } from "http";
import database from "../db/sqlite.js";
import { RouterIncomingMessage } from "../types/http.js";
import { sendNoContentResponse, sendError } from "../utilities/response.js";

function listExistingResetTables(): string[] {
    const rows = database
        .prepare(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('articles','feeds','users')"
        )
        .all() as Array<{ name: string }>;

    const names = new Set(rows.map((r) => r.name));

    return ["articles", "feeds", "users"].filter((name) => names.has(name));
}

export const resetDatabase = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const tables = listExistingResetTables();

        const statements = ["BEGIN;"];
        for (const table of tables) statements.push(`DELETE FROM ${table};`);
        statements.push("COMMIT;");

        database.exec(statements.join("\n"));

        return sendNoContentResponse(res);
    } catch (err: any) {
        return sendError(res, 500, err.toString());
    }
};
