import { rgb, StandardFonts } from 'pdf-lib';
import { truncateText } from './truncateText';
import type { DrawDetailsTableOptions, DetailsTableCellValue } from './types';

const normalizeText = (value: DetailsTableCellValue): string => {
	if (value === null || value === undefined) return '';
	return String(value).trim();
};

const buildColumnWidths = (
	columnCount: number,
	availableWidth: number,
	explicitWidth?: number,
	explicitWidths?: number[]
): number[] => {
	if (columnCount <= 0) return [];

	if (explicitWidths && explicitWidths.length > 0) {
		const fallback = explicitWidth && explicitWidth > 0 ? explicitWidth : availableWidth / columnCount;
		return Array.from({ length: columnCount }, (_, index) => {
			const width = explicitWidths[index] ?? fallback;
			return width > 0 ? width : fallback;
		});
	}

	const sharedWidth = explicitWidth && explicitWidth > 0 ? explicitWidth : availableWidth / columnCount;
	return Array.from({ length: columnCount }, () => sharedWidth);
};

export const drawDetailsTable = async ({
	page,
	pdfDoc,
	pageWidth,
	startY,
	headers,
	rows,
	marginLeft = 20,
	marginRight = 20,
	headerHeight = 22,
	rowHeight = 22,
	rowHeights,
	columnWidth,
	columnWidths,
	cellPaddingX = 6,
	pageHeight,
	marginTop = 40,
	marginBottom = 40,
	repeatHeaderOnPageBreak = true,
}: DrawDetailsTableOptions): Promise<{ y: number }> => {
	const columnCount = headers.length;

	if (columnCount === 0) {
		return { y: startY };
	}

	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

	const headerFontSize = 10;
	const rowFontSize = 10;
	const availableWidth = pageWidth - marginLeft - marginRight;
	const widths = buildColumnWidths(columnCount, availableWidth, columnWidth, columnWidths);

	const borderColor = rgb(0.75, 0.75, 0.75);
	const headerBackground = rgb(0.08, 0.43, 0.81);
	const resolvedPageHeight = pageHeight ?? page.getHeight();

	let currentPage = page;

	const drawTableHeader = (headerStartY: number): number => {
		let currentX = marginLeft;
		const headerY = headerStartY - headerHeight;

		for (let colIndex = 0; colIndex < columnCount; colIndex += 1) {
			const currentWidth = widths[colIndex];
			const headerText = truncateText(headers[colIndex] ?? '', currentWidth - cellPaddingX * 2, boldFont, headerFontSize);
			const headerTextWidth = boldFont.widthOfTextAtSize(headerText, headerFontSize);

			currentPage.drawRectangle({
				x: currentX,
				y: headerY,
				width: currentWidth,
				height: headerHeight,
				color: headerBackground,
				borderColor,
				borderWidth: 1,
			});

			currentPage.drawText(headerText, {
				x: currentX + (currentWidth - headerTextWidth) / 2,
				y: headerY + (headerHeight - headerFontSize) / 2 + 1,
				size: headerFontSize,
				font: boldFont,
				color: rgb(1, 1, 1),
			});

			currentX += currentWidth;
		}

		return headerY;
	};

	let y = drawTableHeader(startY);

	for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
		const height = rowHeights?.[rowIndex] && rowHeights[rowIndex] > 0 ? rowHeights[rowIndex] : rowHeight;


		// Check if the next row will fit on the current page, if not, create a new page and optionally repeat the header
		if (y - height < marginBottom) {
			currentPage = pdfDoc.addPage([pageWidth, resolvedPageHeight]);
			y = repeatHeaderOnPageBreak ? drawTableHeader(resolvedPageHeight - marginTop) : resolvedPageHeight - marginTop;
		}

		const rowY = y - height;
		const row = rows[rowIndex] ?? [];

		let currentX = marginLeft;
		for (let colIndex = 0; colIndex < columnCount; colIndex += 1) {
			const currentWidth = widths[colIndex];
			const cellText = truncateText(normalizeText(row[colIndex]), currentWidth - cellPaddingX * 2, regularFont, rowFontSize);

			currentPage.drawRectangle({
				x: currentX,
				y: rowY,
				width: currentWidth,
				height,
				borderColor,
				borderWidth: 1,
			});

			currentPage.drawText(cellText, {
				x: currentX + cellPaddingX,
				y: rowY + (height - rowFontSize) / 2 + 1,
				size: rowFontSize,
				font: regularFont,
				color: rgb(0.1, 0.1, 0.1),
			});

			currentX += currentWidth;
		}

		y = rowY;
	}

	return { y: y - 8 };
};
