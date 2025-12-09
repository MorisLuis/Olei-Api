import { azureOpenAI } from "../../config/langchain.js";
import { buildSQLPrompt } from "./utils/buildSQLPrompt.js";

export async function generateSQLFromPrompt(prompt: string) {
    const finalPrompt = buildSQLPrompt(prompt);


    const res = await azureOpenAI.invoke([
        { role: "system", content: "Eres un generador de consultas SQL seguras." },
        { role: "user", content: finalPrompt },
    ]);

    const sql = (res.content as string).trim();

    return sql.replace(/```sql|```/g, "").trim();
}
