import type { PDFFont } from "pdf-lib";

/**
 * @description Truncates the text to fit within the specified maxWidth using the provided font and fontSize.
 *
 * @param text The text to be truncated.
 * @param maxWidth The maximum width allowed for the text.
 * @param font The font used to measure the text width.
 * @param fontSize The size of the font used to measure the text width.
 * @returns The truncated text that fits within the specified maxWidth, with an ellipsis added if truncation occurred.
 * 
 * @example
 * const truncatedText = truncateText("This is a long text that needs to be truncated.", 100, myFont, 12);
 * console.log(truncatedText); // Output: "This is a long text..."
 */

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
