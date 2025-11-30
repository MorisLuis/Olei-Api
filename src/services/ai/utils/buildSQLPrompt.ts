import { getRules } from "../prompts/rules";
import { getContextWhiteList } from "../prompts/contextWhiteList";

export function buildSQLPrompt(userPrompt: string): string {
    const rules = getRules(); 
    const contextWhiteList = getContextWhiteList(userPrompt);

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