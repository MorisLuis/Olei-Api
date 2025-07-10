import type { PDFFont } from "pdf-lib";

// Función auxiliar para truncar texto
export const truncateText = (text: string, maxWidth: number, font: PDFFont, fontSize: number): string => {
    let truncated = text;
    while (font.widthOfTextAtSize(truncated, fontSize) > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
    }
    if (truncated !== text && truncated.length > 3) {
        truncated = truncated.slice(0, -3) + '...';
    }
    return truncated;
};
