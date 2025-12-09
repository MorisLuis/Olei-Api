"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSQLPrompt = void 0;
const rules_1 = require("../prompts/rules");
const contextWhiteList_1 = require("../prompts/contextWhiteList");
function buildSQLPrompt(userPrompt) {
    const rules = (0, rules_1.getRules)();
    const contextWhiteList = (0, contextWhiteList_1.getContextWhiteList)(userPrompt);
    const promptCompleto = `
        ${rules}
    
        ${contextWhiteList}

        Petición del usuario:
        ${userPrompt}
        `.trim();
    return `
            Eres un asistente experto en SQL Server.
            Convierte esta solicitud del usuario en una consulta SQL segura y simple basada en tablas, no en stored procedures.
            No incluyas explicaciones, solo devuelve el SQL final: 

            ${promptCompleto}
        `.trim();
}
exports.buildSQLPrompt = buildSQLPrompt;
//# sourceMappingURL=buildSQLPrompt.js.map