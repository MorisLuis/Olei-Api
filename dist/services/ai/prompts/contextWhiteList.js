"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContextWhiteList = void 0;
const constans_1 = require("../constans");
function getContextWhiteList(userPrompt) {
    const lower = userPrompt.toLowerCase();
    let categoria = "";
    let vistas = [];
    if ((lower.includes("compra") && lower.includes("venta")) ||
        (lower.includes("movimientos") && lower.includes("inventario"))) {
        categoria = "ℹ Contexto general: se incluyen todas las vistas.";
        vistas = constans_1.whitelist.vistas;
    }
    else if (lower.includes("compra")) {
        categoria = "💼 Contexto de COMPRAS detectado:";
        vistas = constans_1.whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("compra"));
    }
    else if (lower.includes("cobranza") || lower.includes("abonos")) {
        categoria = "💼 Contexto de COBRANZA detectado:";
        vistas = constans_1.whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("cobranza"));
    }
    else if (lower.includes("venta")) {
        categoria = "💰 Contexto de VENTAS detectado:";
        vistas = constans_1.whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("venta"));
    }
    else if (lower.includes("existencia") && lower.includes("producto")) {
        categoria = "📦 Contexto de EXISTENCIAS de PRODUCTOS detectado:";
        vistas = constans_1.whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("existencia"));
    }
    else if (lower.includes("producto") || lower.includes("codigo")) {
        categoria = "📦 Contexto de PRODUCTOS detectado:";
        vistas = constans_1.whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("producto"));
    }
    else if (lower.includes("cliente")) {
        categoria = "📦 Contexto de CLIENTES detectado:";
        vistas = constans_1.whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("cliente"));
    }
    else {
        categoria = "ℹ Contexto general: se incluyen todas las vistas.";
        vistas = constans_1.whitelist.vistas;
    }
    const vistasTexto = vistas
        .map(v => `• ${v.nombre} → ${v.descripcion}\n  Campos: ${v.camposPermitidos.join(", ")}`)
        .join("\n\n");
    return `
        ${categoria}

        Estas son las vistas disponibles y su propósito:

        ${vistasTexto}

        Instrucciones para la IA:
        - Usa una sola vista según el contexto del usuario.
        - No mezcles campos de diferentes vistas.
    `.trim();
}
exports.getContextWhiteList = getContextWhiteList;
//# sourceMappingURL=contextWhiteList.js.map