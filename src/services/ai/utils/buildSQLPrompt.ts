import { whitelist } from "../constans";
import fs from "fs";

export function buildSQLPrompt(userPrompt: string): string {
    const contextoFiltrado = generarContextoDesdeWhitelistFiltradoVB(userPrompt);
    const promptPrediccion = obtenerPromptPrediccionVB(userPrompt);


    const reglasDuras = `
        REGLAS ESTRICTAS DEL AGENTE SQL:
        - Si el usuario pide un campo que NO existe en el whitelist → responde SOLO: "ERROR: Campo no permitido."
        - Si el usuario pide mezclar categorías (ventas + compras + existencias, etc.) → responde SOLO: "ERROR: No se pueden mezclar categorías."
        - Si la solicitud es ambigua o no específica (ej. "el reporte ese", "ya sabes", "las cosas de antes") → responde SOLO: "ERROR: Solicitud ambigua."
        - Si el usuario pide varias vistas simultáneamente → responde SOLO: "ERROR: Selecciona una sola vista."
        - Si el usuario pide predicciones sin datos suficientes → responde SOLO: "ERROR: No es posible generar predicción."
        - Si el usuario pide información inexistente → responde SOLO: "ERROR: La información solicitada no existe."
        - NO inventes campos, NO infieras nombres, NO propongas tablas nuevas.
        - Si no estás 100% seguro de qué vista usar → responde SOLO: "ERROR: Solicitud no válida."
        - SIEMPRE devuelve SOLO SQL, excepto cuando apliquen estos errores.

        - El ulitmo query generado simplemente agregale un paginado para obtener solo 20 registros por consulta.
    `;

    const promptCompleto = `
        ${reglasDuras}
    
        ${contextoFiltrado}

        ${promptPrediccion}

        Petición del usuario:
        ${userPrompt}
        `.trim();

        return `
            Eres un asistente experto en SQL Server.
            Convierte esta solicitud del usuario en una consulta SQL segura y simple basada en tablas, no en stored procedures.
            No incluyas explicaciones, solo devuelve el SQL final: ${promptCompleto}
        `.trim();
}



export function generarContextoDesdeWhitelistFiltradoVB(userPrompt: string): string {
    const lower = userPrompt.toLowerCase();
    let categoria = "";
    let vistas = [];

    if ((lower.includes("compra") && lower.includes("venta")) ||
        (lower.includes("movimientos") && lower.includes("inventario"))) {
        categoria = "ℹ Contexto general: se incluyen todas las vistas.";
        vistas = whitelist.vistas;
    }
    else if (lower.includes("compra")) {
        categoria = "💼 Contexto de COMPRAS detectado:";
        vistas = whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("compra"));
    }
    else if (lower.includes("cobranza") || lower.includes("abonos")) {
        categoria = "💼 Contexto de COBRANZA detectado:";
        vistas = whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("cobranza"));
    }
    else if (lower.includes("venta")) {
        categoria = "💰 Contexto de VENTAS detectado:";
        vistas = whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("venta"));
    }
    else if (lower.includes("existencia") && lower.includes("producto")) {
        categoria = "📦 Contexto de EXISTENCIAS de PRODUCTOS detectado:";
        vistas = whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("existencia"));
    }
    else if (lower.includes("producto") || lower.includes("codigo")) {
        categoria = "📦 Contexto de PRODUCTOS detectado:";
        vistas = whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("producto"));
    }
    else if (lower.includes("cliente")) {
        categoria = "📦 Contexto de CLIENTES detectado:";
        vistas = whitelist.vistas.filter(v => v.nombre.toLowerCase().includes("cliente"));
    }
    else {
        categoria = "ℹ Contexto general: se incluyen todas las vistas.";
        vistas = whitelist.vistas;
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

export function obtenerPromptPrediccionVB(userPrompt: string) {
    if (!/(predic|proyecta|tendencia|estim)/i.test(userPrompt)) return "";

    return `
⚙ Genera una consulta SQL con proyección de tendencia (modo predictivo activado).
📊 SI EL USUARIO PIDE UNA PREDICCIÓN, PROYECCIÓN O TENDENCIA:
- Usa SQL con funciones de ventana (OVER) para calcular promedios móviles o tendencias lineales.
- No inventes valores fuera del rango histórico; la proyección debe basarse en los datos de los últimos meses.
- Si el usuario pide ventas del próximo mes, usa los promedios de los últimos 3–6 meses.
`.trim();
}


export function obtenerInstruccionesLiteVB() {
    return fs.readFileSync("./instruccionesLite.txt", "utf8");
}


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