import { rgb, StandardFonts } from 'pdf-lib';
import type { PDFDocument, PDFPage } from 'pdf-lib';

interface DrawSellReportFooterOptions {
	page: PDFPage;
	pdfDoc: PDFDocument;
	pageWidth: number;
	pageHeight: number;
	startY: number;
	marginLeft?: number;
	marginRight?: number;
	marginBottom?: number;
}

export const drawSellReportFooter = async ({
	page,
	pdfDoc,
	pageWidth,
	pageHeight,
	startY,
	marginLeft = 40,
	marginRight = 40,
	marginBottom = 30,
}: DrawSellReportFooterOptions): Promise<{ page: PDFPage; y: number }> => {
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const textSize = 10;

	const gapBetweenSignatures = 60;
	const lineY = marginBottom + 46;
	const textY = lineY - 18;
	const requiredTopY = lineY + 28;

	let targetPage = page;
	if (startY < requiredTopY) {
		targetPage = pdfDoc.addPage([pageWidth, pageHeight]);
	}

	const availableWidth = pageWidth - marginLeft - marginRight;
	const lineWidth = (availableWidth - gapBetweenSignatures) / 2;

	const leftStartX = marginLeft;
	const leftEndX = leftStartX + lineWidth;
	const rightStartX = pageWidth - marginRight - lineWidth;
	const rightEndX = pageWidth - marginRight;

	const strokeColor = rgb(0.2, 0.2, 0.2);

	targetPage.drawLine({
		start: { x: leftStartX, y: lineY },
		end: { x: leftEndX, y: lineY },
		color: strokeColor,
		thickness: 1,
	});

	targetPage.drawLine({
		start: { x: rightStartX, y: lineY },
		end: { x: rightEndX, y: lineY },
		color: strokeColor,
		thickness: 1,
	});

	const clientText = 'FIRMA DEL CLIENTE';
	const sellerText = 'FIRMA DEL VENDEDOR';
	const clientTextWidth = boldFont.widthOfTextAtSize(clientText, textSize);
	const sellerTextWidth = boldFont.widthOfTextAtSize(sellerText, textSize);

	targetPage.drawText(clientText, {
		x: leftStartX + (lineWidth - clientTextWidth) / 2,
		y: textY,
		size: textSize,
		font: boldFont,
		color: strokeColor,
	});

	targetPage.drawText(sellerText, {
		x: rightStartX + (lineWidth - sellerTextWidth) / 2,
		y: textY,
		size: textSize,
		font: boldFont,
		color: strokeColor,
	});

	return {
		page: targetPage,
		y: textY - 10,
	};
};
