import { rgb, StandardFonts } from 'pdf-lib';
import type { PDFDocument, PDFPage } from 'pdf-lib';
import { truncateText } from '../../../shared/pdf/truncateText';

interface DrawSellReportTableFooterOptions {
	page: PDFPage;
	pdfDoc: PDFDocument;
	pageWidth: number;
	pageHeight: number;
	startY: number;
	marginLeft?: number;
	marginRight?: number;
	marginTop?: number;
	marginBottom?: number;
	rowHeight?: number;
	rightPanelWidthRatio?: number;
	observationsTitle?: string;
	ivaLabel?: string;
	subtotalLabel?: string;
	totalLabel?: string;
}

export const drawSellReportTableFooter = async ({
	page,
	pdfDoc,
	pageWidth,
	pageHeight,
	startY,
	marginLeft = 40,
	marginRight = 40,
	marginTop = 40,
	marginBottom = 40,
	rowHeight = 22,
	rightPanelWidthRatio = 0.30,
	observationsTitle = 'OBSERVACIONES',
	ivaLabel = 'I.V.A:',
	subtotalLabel = 'SUBTOTAL:',
	totalLabel = 'TOTAL:',
}: DrawSellReportTableFooterOptions): Promise<{ page: PDFPage; y: number }> => {
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const textSize = 10;

	const tableWidth = pageWidth - marginLeft - marginRight;
	const safeRatio = Math.min(0.45, Math.max(0.2, rightPanelWidthRatio));
	const rightPanelWidth = tableWidth * safeRatio;
	const leftPanelWidth = tableWidth - rightPanelWidth;
	const totalHeight = rowHeight * 3;

	let targetPage = page;
	let topY = startY;

	if (topY - totalHeight < marginBottom) {
		targetPage = pdfDoc.addPage([pageWidth, pageHeight]);
		topY = pageHeight - marginTop;
	}

	const borderColor = rgb(0.75, 0.75, 0.75);
	const blueHeader = rgb(0.08, 0.43, 0.81);

	const rightX = marginLeft + leftPanelWidth;

	// Left panel header: OBSERVACIONES
	const leftHeaderY = topY - rowHeight;
	targetPage.drawRectangle({
		x: marginLeft,
		y: leftHeaderY,
		width: leftPanelWidth,
		height: rowHeight,
		color: blueHeader,
		borderColor,
		borderWidth: 1,
	});

	const safeObservationsTitle = truncateText(observationsTitle, leftPanelWidth - 12, boldFont, textSize);
	const titleWidth = boldFont.widthOfTextAtSize(safeObservationsTitle, textSize);
	targetPage.drawText(safeObservationsTitle, {
		x: marginLeft + (leftPanelWidth - titleWidth) / 2,
		y: leftHeaderY + (rowHeight - textSize) / 2 + 1,
		size: textSize,
		font: boldFont,
		color: rgb(1, 1, 1),
	});

	// Left panel body (spans 2 rows)
	targetPage.drawRectangle({
		x: marginLeft,
		y: topY - totalHeight,
		width: leftPanelWidth,
		height: rowHeight * 2,
		borderColor,
		borderWidth: 1,
	});

	const rightLabels = [ivaLabel, subtotalLabel, totalLabel];
	rightLabels.forEach((label, index) => {
		const cellTopY = topY - rowHeight * index;
		const cellY = cellTopY - rowHeight;

		targetPage.drawRectangle({
			x: rightX,
			y: cellY,
			width: rightPanelWidth,
			height: rowHeight,
			borderColor,
			borderWidth: 1,
		});

		const safeLabel = truncateText(label, rightPanelWidth - 12, boldFont, textSize + 1);
		const labelWidth = boldFont.widthOfTextAtSize(safeLabel, textSize + 1);
		targetPage.drawText(safeLabel, {
			x: rightX + rightPanelWidth - labelWidth - 8,
			y: cellY + (rowHeight - (textSize + 1)) / 2 + 1,
			size: textSize + 1,
			font: boldFont,
			color: index === 2 ? rgb(0.82, 0.12, 0.12) : rgb(0.12, 0.12, 0.12),
		});
	});

	return {
		page: targetPage,
		y: topY - totalHeight,
	};
};
