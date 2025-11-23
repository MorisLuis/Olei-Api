export function getContextPrediction(userPrompt: string) {
    if (!/(predic|proyecta|tendencia|estim)/i.test(userPrompt)) return "";

    return `
        ⚙ Genera una consulta SQL con proyección de tendencia (modo predictivo activado).
        📊 SI EL USUARIO PIDE UNA PREDICCIÓN, PROYECCIÓN O TENDENCIA:
        - Usa SQL con funciones de ventana (OVER) para calcular promedios móviles o tendencias lineales.
        - No inventes valores fuera del rango histórico; la proyección debe basarse en los datos de los últimos meses.
        - Si el usuario pide ventas del próximo mes, usa los promedios de los últimos 3–6 meses.
    `.trim();
}
