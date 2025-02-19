import { PDFDocument, rgb } from "pdf-lib";


const generatePDF = async (data: { name: string; message: string }) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    page.drawText(`Hola, ${data.name}!`, { x: 50, y: 350, size: 24, color: rgb(0, 0, 0) });
    page.drawText(data.message, { x: 50, y: 300, size: 16, color: rgb(0.2, 0.2, 0.8) });

    return await pdfDoc.save();
};

export { generatePDF }