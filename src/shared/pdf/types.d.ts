import type { PDFDocument, PDFPage } from "pdf-lib";

export  interface DrawHeaderImageOptions {
    title: string;
	Folio: string;

    page: PDFPage;
    pdfDoc: PDFDocument;
    pageWidth: number;
    pageHeight: number;

    marginLeft?: number;
    marginRight?: number;
    imagePath?: string;
    company?: string;
}

export interface InformationSectionField {
	label: string;
	value?: string | number | null;
}

export interface DrawInformationSectionOptions {
	page: PDFPage;
	pdfDoc: PDFDocument;
	pageWidth: number;
	startY: number;
	data: InformationSectionField[];

	title?: string;
	marginLeft?: number;
	marginRight?: number;
	rowHeight?: number;
	headerHeight?: number;
	cellPaddingX?: number;
}

export type DetailsTableCellValue = string | number | null | undefined;

export interface DrawDetailsTableOptions {
	page: PDFPage;
	pdfDoc: PDFDocument;
	pageWidth: number;
	startY: number;
	headers: string[];
	rows: DetailsTableCellValue[][];

	marginLeft?: number;
	marginRight?: number;
	headerHeight?: number;
	rowHeight?: number;
	rowHeights?: number[];
	columnWidth?: number;
	columnWidths?: number[];
	cellPaddingX?: number;
	pageHeight?: number;
	marginTop?: number;
	marginBottom?: number;
	repeatHeaderOnPageBreak?: boolean;
}
