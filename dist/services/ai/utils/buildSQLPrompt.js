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
/* export function buildSQLPrompt(userPrompt: string): string {
    const context = getContextFromPrompt(userPrompt);

    const vistasInfo = whitelist.vistas
        .map(v =>
            `• ${v.nombre} → ${v.descripcion}\n  Campos: ${v.camposPermitidos.join(", ")}\n  Ordenar por: ${v.orderBy}`
        )
        .join("\n\n");

    return `
        Eres un asistente experto en SQL Server.
        Convierte esta solicitud del usuario en una consulta SQL **segura**, **simple** y basada en **vistas autorizadas**, no en stored procedures.
        
        ${context}
        
        Estas son las vistas disponibles y su propósito:
        ${vistasInfo}
        
        ⚠️ Reglas:
        - Usa una sola vista por consulta.
        - No mezcles campos de diferentes vistas.
        - Si el usuario pide productos o marcas → usa las vistas con detalle de producto.
        - Si el usuario pide totales o resumen → usa las vistas con totales.
        - Si pide compras → usa las vistas con la palabra 'Compra'.
        - Si pide ventas → usa las vistas con la palabra 'Venta'.
        - Si pide existencias → usa las vistas con 'Existencia'.
        - Si el usuario dice 'incluir totales', usa GROUPING SETS o ROLLUP (no UNION).
        - Etiqueta la fila total como 'TOTAL GENERAL'.
        - Si menciona 'predicción' o 'tendencia', usa funciones OVER() para calcular promedio móvil.
        - Devuelve solo el SQL final, sin explicaciones, comentarios ni texto adicional.

        - Si es necesario ordernar → usar solo 'Ordenar por' y nada mas.
        - Agrega siempre el paginado para solo obtener por lo pronto 20 registros

        Petición del usuario:
        ${userPrompt}
    `;
}
 */ 
//# sourceMappingURL=buildSQLPrompt.js.map