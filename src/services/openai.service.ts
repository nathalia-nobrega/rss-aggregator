import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI();

export async function generateArticleSummary(title: string, content: string) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn("[AI] Skipping summary: OPENAI_API_KEY not found");
            return null;
        }

        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful assistant that summarizes RSS feed content concisely.",
                },
                {
                    role: "user",
                    content: `Summarize this RSS feed in 2-3 concise sentences: \n\nTitle: ${title}\nContent: ${content}`,
                },
            ],
            max_completion_tokens: 100,
            response_format: { type: "json_object" },
        });

        console.debug("[AI] Summary generated successfully");
        return response.choices?.[0]?.message?.content?.trim() ?? null;
    } catch (err: any) {
        if (err.status === 429) {
            console.error("[AI] Quota exceeded (429). Skipping summary.");
        } else {
            console.error("[AI] Error generating summary:", err.message);
        }
        return null;
    }
}
