import { createHash } from "crypto";

// TODO: UNDERSTAND WHY HASHING IS NEEDED
export const generateContentHash = (content: string): string => {
    return createHash("sha256").update(content).digest("hex");
};
