"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSQLFromPrompt = void 0;
const langchain_1 = require("../../config/langchain");
const buildSQLPrompt_1 = require("./utils/buildSQLPrompt");
async function generateSQLFromPrompt(prompt) {
    const finalPrompt = (0, buildSQLPrompt_1.buildSQLPrompt)(prompt);
    const res = await langchain_1.azureOpenAI.invoke([
        { role: "system", content: "Eres un generador de consultas SQL seguras." },
        { role: "user", content: finalPrompt },
    ]);
    const sql = res.content.trim();
    return sql.replace(/```sql|```/g, "").trim();
}
exports.generateSQLFromPrompt = generateSQLFromPrompt;
//# sourceMappingURL=sqlPrompt.service.js.map