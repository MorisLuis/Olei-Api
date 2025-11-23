export type AIResponseType =
    | "SQL"
    | "CLARIFICATION"
    | "INVALID"
    | "UNSAFE_SQL";

export function classifyAIResponse(text: string): AIResponseType {
    const upper = text.toUpperCase().trim();

    // Mensajes de error explícitos producidos por tu prompt
    if (upper.startsWith("ERROR:")) {
        return "INVALID";
    }

    // Pide aclaración (ambigüedad)
    if (
        upper.includes("SOLICITUD AMBIGUA") ||
        upper.includes("NECESITO MÁS DETALLES") ||
        upper.includes("NO SE PUEDE DETERMINAR")
    ) {
        return "CLARIFICATION";
    }

    // SQL peligroso
    if (
        upper.includes("DELETE ") ||
        upper.includes("UPDATE ") ||
        upper.includes("INSERT ") ||
        upper.includes("DROP ") ||
        upper.includes("ALTER ") ||
        upper.includes("TRUNCATE ")
    ) {
        return "UNSAFE_SQL";
    }

    // Si empieza con SELECT → se considera SQL válido
    if (upper.startsWith("SELECT")) {
        return "SQL";
    }

    // Cualquier otra cosa → inválido
    return "INVALID";
}
