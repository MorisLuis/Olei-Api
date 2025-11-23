"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askAI = void 0;
require("dotenv/config");
const sqlPrompt_service_1 = require("../../services/ai/sqlPrompt.service");
const executeSQLQuery_1 = require("./utils/executeSQLQuery");
const isSafeSQL_1 = require("./utils/isSafeSQL");
const classifier_1 = require("./utils/classifier");
const response_1 = require("../../helpers/response");
const askAI = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt)
            return res.status(400).json({ error: "Falta el prompt compa" });
        const aiText = await (0, sqlPrompt_service_1.generateSQLFromPrompt)(prompt);
        const type = (0, classifier_1.classifyAIResponse)(aiText);
        console.log("🤖 Respuesta de la IA:", { type, aiText });
        if (type !== "SQL") {
            return res.json({
                ok: false,
                type,
                message: aiText
            });
        }
        if (!(0, isSafeSQL_1.isSafeSQL)(aiText)) {
            return res.status(400).json({ error: "Consulta SQL no segura" });
        }
        const userSession = req.sessionWeb;
        const data = await (0, executeSQLQuery_1.executeSQLQuery)({ userSession, query: aiText });
        const headers = Object.keys(data[0] ? data[0] : {});
        return (0, response_1.successResponse)(req, res, { type, query: aiText, headers }, "Consulta AI exitosa", 200, { totals: { show: data.length, total: data.length }, pages: { current: 1, totalPages: 1 } });
    }
    catch (error) {
        console.error("❌ Error en askAI:", error);
        return res.status(500).json({ error: "Error del servidor compa" });
    }
};
exports.askAI = askAI;
//# sourceMappingURL=ai.controller.js.map