"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawHeader = void 0;
const pdf_lib_1 = require("pdf-lib");
const drawHeader = async ({ page, pdfDoc, pageWidth, pageHeight, marginLeft = 50, marginRight = 50, company }) => {
    // 1. Configuración de texto "Company"
    const helveticaFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    const companyText = company?.trim() || 'Olei Software';
    const fontSize = 20;
    const textWidth = helveticaFont.widthOfTextAtSize(companyText, fontSize);
    const textHeight = fontSize;
    const textX = marginLeft;
    const textY = pageHeight - textHeight - 20;
    // 2. Dibujar texto "Company"
    page.drawText(companyText, {
        x: textX,
        y: textY,
        size: fontSize,
        font: helveticaFont,
        color: (0, pdf_lib_1.rgb)(0, 0, 0),
    });
    // 3. Texto a la derecha alineado inferior con "Company"
    const helveticaRegularFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const currentDate = new Date();
    const dateText = currentDate.toLocaleDateString('es-MX');
    const titleText = 'Relaciones de Documentos Pendientes de Pago';
    const smallFontSize = 10;
    const lineSpacing = 2;
    const dateTextWidth = helveticaRegularFont.widthOfTextAtSize(dateText, smallFontSize);
    const titleTextWidth = helveticaFont.widthOfTextAtSize(titleText, smallFontSize);
    const rightLimitX = pageWidth - marginRight;
    const dateTextX = rightLimitX - dateTextWidth;
    const titleTextX = rightLimitX - titleTextWidth;
    // 🧠 Nuevo cálculo: alinear base del bloque de texto con la base del texto "Company"
    const totalTextHeight = smallFontSize * 2 + lineSpacing;
    const bottomAlignedY = textY + totalTextHeight - smallFontSize;
    // Línea 1 - Fecha (arriba)
    page.drawText(dateText, {
        x: dateTextX,
        y: bottomAlignedY,
        size: smallFontSize,
        font: helveticaRegularFont,
        color: (0, pdf_lib_1.rgb)(0, 0, 0),
    });
    // Línea 2 - Título (abajo)
    page.drawText(titleText, {
        x: titleTextX,
        y: bottomAlignedY - smallFontSize - lineSpacing,
        size: smallFontSize,
        font: helveticaFont,
        color: (0, pdf_lib_1.rgb)(0, 0, 0),
    });
};
exports.drawHeader = drawHeader;
//# sourceMappingURL=drawHeader.js.map