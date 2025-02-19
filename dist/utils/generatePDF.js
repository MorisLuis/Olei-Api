"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = void 0;
const pdf_lib_1 = require("pdf-lib");
const generatePDF = async (data) => {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    page.drawText(`Hola, ${data.name}!`, { x: 50, y: 350, size: 24, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
    page.drawText(data.message, { x: 50, y: 300, size: 16, color: (0, pdf_lib_1.rgb)(0.2, 0.2, 0.8) });
    return await pdfDoc.save();
};
exports.generatePDF = generatePDF;
//# sourceMappingURL=generatePDF.js.map