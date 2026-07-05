import { rgb, StandardFonts } from 'pdf-lib';
import { truncateText } from './truncateText';
import type { DrawInformationSectionOptions } from './types';


const normalizeText = (value: string | number | null | undefined): string => {
	if (value === null || value === undefined) return '-';
	const raw = String(value).trim();
	return raw.length > 0 ? raw : '-';
};

export const drawInformationSection = async ({
	page,
	pdfDoc,
	pageWidth,
	startY,
	data,
	title = 'DATOS DEL CLIENTE',
	marginLeft = 20,
	marginRight = 20,
	rowHeight = 22,
	headerHeight = 18,
	cellPaddingX = 6,
}: DrawInformationSectionOptions): Promise<{ y: number }> => {
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

	const tableWidth = pageWidth - marginLeft - marginRight;
	const pairsPerRow = 2;
	const rows = Math.ceil(data.length / pairsPerRow);

	const halfWidth = tableWidth / 2;
	const labelWidth = halfWidth * 0.30;
	const valueWidth = halfWidth - labelWidth - cellPaddingX * 2;

	const headerFontSize = 11;
	const rowFontSize = 10;
	const labelColor = rgb(0.18, 0.18, 0.18);
	const valueColor = rgb(0.1, 0.1, 0.1);

	const headerY = startY - headerHeight;

	page.drawRectangle({
		x: marginLeft,
		y: headerY,
		width: tableWidth,
		height: headerHeight,
		color: rgb(0.08, 0.43, 0.81),
	});

	const safeHeaderTitle = truncateText(title.trim() || 'DATOS', tableWidth - 12, boldFont, headerFontSize);
	const headerTitleWidth = boldFont.widthOfTextAtSize(safeHeaderTitle, headerFontSize);

	page.drawText(safeHeaderTitle, {
		x: marginLeft + (tableWidth - headerTitleWidth) / 2,
		y: headerY + (headerHeight - headerFontSize) / 2 + 1,
		size: headerFontSize,
		font: boldFont,
		color: rgb(1, 1, 1),
	});

	let y = headerY - rowHeight;

	for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
		const left = data[rowIndex * 2];
		const right = data[rowIndex * 2 + 1];

		if (left) {
			const leftLabel = truncateText(`${normalizeText(left.label)}:`, labelWidth - cellPaddingX * 2, boldFont, rowFontSize);
			const leftValue = truncateText(normalizeText(left.value), valueWidth, regularFont, rowFontSize);

			page.drawText(leftLabel, {
				x: marginLeft + cellPaddingX,
				y: y + (rowHeight - rowFontSize) / 2,
				size: rowFontSize,
				font: boldFont,
				color: labelColor,
			});

			page.drawText(leftValue, {
				x: marginLeft + labelWidth + cellPaddingX,
				y: y + (rowHeight - rowFontSize) / 2,
				size: rowFontSize,
				font: regularFont,
				color: valueColor,
			});
		}

		if (right) {
			const rightLabel = truncateText(`${normalizeText(right.label)}:`, labelWidth - cellPaddingX * 2, boldFont, rowFontSize);
			const rightValue = truncateText(normalizeText(right.value), valueWidth, regularFont, rowFontSize);

			page.drawText(rightLabel, {
				x: marginLeft + halfWidth + cellPaddingX,
				y: y + (rowHeight - rowFontSize) / 2,
				size: rowFontSize,
				font: boldFont,
				color: labelColor,
			});

			page.drawText(rightValue, {
				x: marginLeft + halfWidth + labelWidth + cellPaddingX,
				y: y + (rowHeight - rowFontSize) / 2,
				size: rowFontSize,
				font: regularFont,
				color: valueColor,
			});
		}

		y -= rowHeight;
	}

	return { y: rows > 0 ? y : headerY - 8 };
};
