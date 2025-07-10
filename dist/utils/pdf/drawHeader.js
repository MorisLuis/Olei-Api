"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawHeader = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
const drawHeader = async ({ page, pdfDoc, pageWidth, pageHeight, marginLeft = 50, marginRight = 50, imagePath = path_1.default.join(__dirname, '../../../public/Logo_horizontal2.png'), }) => {
    // 1. Cargar y escalar imagen
    const imageBytes = fs_1.default.readFileSync(imagePath);
    const embeddedImage = await pdfDoc.embedPng(imageBytes);
    const maxImageWidth = pageWidth * 0.3;
    const maxImageHeight = pageHeight * 0.1;
    const { width: originalWidth, height: originalHeight } = embeddedImage;
    const scale = Math.min(maxImageWidth / originalWidth, maxImageHeight / originalHeight);
    const imageWidth = originalWidth * scale;
    const imageHeight = originalHeight * scale;
    const imageX = marginLeft;
    const imageY = pageHeight - imageHeight - 20;
    // 2. Dibujar imagen
    page.drawImage(embeddedImage, {
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,
    });
    // 3. Borde opcional para debug
    page.drawRectangle({
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,
        borderWidth: 1,
        color: undefined,
        borderColor: (0, pdf_lib_1.rgb)(1, 0, 0),
    });
    // 4. Texto a la derecha alineado inferior con la imagen
    const helveticaFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    const currentDate = new Date();
    const dateText = currentDate.toLocaleDateString('es-MX');
    const titleText = 'Relaciones de Documentos Pendientes de Pago';
    const fontSize = 10;
    const lineSpacing = 2;
    const dateTextWidth = helveticaFont.widthOfTextAtSize(dateText, fontSize);
    const titleTextWidth = helveticaBoldFont.widthOfTextAtSize(titleText, fontSize);
    const rightLimitX = pageWidth - marginRight;
    const dateTextX = rightLimitX - dateTextWidth;
    const titleTextX = rightLimitX - titleTextWidth;
    // 🧠 Nuevo cálculo: alinear base del bloque de texto con la base del logo
    const totalTextHeight = fontSize * 2 + lineSpacing;
    const bottomAlignedY = imageY + totalTextHeight - fontSize;
    // Línea 1 - Fecha (arriba)
    page.drawText(dateText, {
        x: dateTextX,
        y: bottomAlignedY,
        size: fontSize,
        font: helveticaFont,
        color: (0, pdf_lib_1.rgb)(0, 0, 0),
    });
    // Línea 2 - Título (abajo)
    page.drawText(titleText, {
        x: titleTextX,
        y: bottomAlignedY - fontSize - lineSpacing,
        size: fontSize,
        font: helveticaBoldFont,
        color: (0, pdf_lib_1.rgb)(0, 0, 0),
    });
};
exports.drawHeader = drawHeader;
//# sourceMappingURL=drawHeader.js.map