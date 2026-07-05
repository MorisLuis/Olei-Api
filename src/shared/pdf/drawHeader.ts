import { rgb, StandardFonts } from 'pdf-lib';
import { truncateText } from './truncateText';
import type { DrawHeaderImageOptions } from './types';


export const drawHeader = async ({
    title,
    page,
    pdfDoc,
    pageWidth,
    pageHeight,
    marginLeft = 20,
    marginRight = 20,
    company,
}: DrawHeaderImageOptions ): Promise<{ y: number }> => {

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaRegularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const smallFontSize = 10;
    const companyFontSize = 20;
    const lineSpacing = 2;

    const companyText = company?.trim() || 'Olei Software';
    const titleText = title?.trim() || 'Sin título';

    const rightLimitX = pageWidth - marginRight;
    const rightBlockWidth = Math.min(220, pageWidth * 0.35);
    const maxCompanyWidth = Math.max(80, pageWidth - marginLeft - marginRight - rightBlockWidth - 20);

    const safeCompanyText = truncateText(companyText, maxCompanyWidth, helveticaFont, companyFontSize);
    const safeTitleText = truncateText(titleText, rightBlockWidth, helveticaFont, smallFontSize);

    const textHeight = companyFontSize;
    const textX = marginLeft;
    const textY = pageHeight - textHeight - 20;

    page.drawText(safeCompanyText, {
        x: textX,
        y: textY,
        size: companyFontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    const currentDate = new Date();
    const dateText = currentDate.toLocaleDateString('es-MX');

    const dateTextWidth = helveticaRegularFont.widthOfTextAtSize(dateText, smallFontSize);
    const titleTextWidth = helveticaFont.widthOfTextAtSize(safeTitleText, smallFontSize);

    const dateTextX = rightLimitX - dateTextWidth;
    const titleTextX = rightLimitX - titleTextWidth;

    const totalTextHeight = smallFontSize * 2 + lineSpacing;
    const bottomAlignedY = textY + totalTextHeight - smallFontSize;

    page.drawText(dateText, {
        x: dateTextX,
        y: bottomAlignedY,
        size: smallFontSize,
        font: helveticaRegularFont,
        color: rgb(0, 0, 0),
    });

    page.drawText(safeTitleText, {
        x: titleTextX,
        y: bottomAlignedY - smallFontSize - lineSpacing,
        size: smallFontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    const dividerY = bottomAlignedY - smallFontSize - lineSpacing - 10;
    page.drawLine({
        start: { x: marginLeft, y: dividerY },
        end: { x: pageWidth - marginRight, y: dividerY },
        color: rgb(0.75, 0.75, 0.75),
        thickness: 2,
    });

    return {
        y: dividerY - 10,
    }
};