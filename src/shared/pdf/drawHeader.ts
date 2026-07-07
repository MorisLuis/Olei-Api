import { rgb, StandardFonts } from 'pdf-lib';
import { truncateText } from './truncateText';
import type { DrawHeaderImageOptions } from './types';


export const drawHeader = async ({
    title,
    Folio,
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
    const rightBlockWidth = Math.min(120, pageWidth * 0.35);
    const maxCompanyWidth = Math.max(80, pageWidth - marginLeft - marginRight - rightBlockWidth - 20);
    const titleBadgePaddingX = 8;
    const titleBadgePaddingY = 4;

    const safeCompanyText = truncateText(companyText, maxCompanyWidth, helveticaFont, companyFontSize);
    const safeTitleText = truncateText(titleText.toUpperCase(), rightBlockWidth - titleBadgePaddingX * 2, helveticaFont, smallFontSize);

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

    const titleTextWidth = helveticaFont.widthOfTextAtSize(safeTitleText, smallFontSize);
    const titleBadgeHeight = smallFontSize + titleBadgePaddingY * 2;
    const titleBadgeX = rightLimitX - rightBlockWidth;
    const titleBadgeY = textY + smallFontSize - 2;

    page.drawRectangle({
        x: titleBadgeX,
        y: titleBadgeY,
        width: rightBlockWidth,
        height: titleBadgeHeight,
        color: rgb(0, 0, 0),
    });

    page.drawText(safeTitleText, {
        x: titleBadgeX + (rightBlockWidth - titleTextWidth) / 2,
        y: titleBadgeY + titleBadgePaddingY,
        size: smallFontSize,
        font: helveticaFont,
        color: rgb(1, 1, 1),
    });

    let detailLineY = titleBadgeY - (smallFontSize + lineSpacing);

    if (Folio) {
        const folioTextWidth = helveticaFont.widthOfTextAtSize(Folio.toString(), smallFontSize + 2);
        page.drawText(Folio.toString(), {
            x: titleBadgeX + (rightBlockWidth - folioTextWidth) / 2,
            y: detailLineY,
            size: smallFontSize + 2,
            font: helveticaFont,
            color: rgb(0.85, 0, 0),
        });
    } else {
        const currentDate = new Date();
        const dateText = currentDate.toLocaleDateString('es-MX');
        const dateTextWidth = helveticaRegularFont.widthOfTextAtSize(dateText, smallFontSize);
        page.drawText(dateText, {
            x: rightLimitX - dateTextWidth,
            y: detailLineY,
            size: smallFontSize,
            font: helveticaRegularFont,
            color: rgb(0, 0, 0),
        });
    }

    const dividerY = detailLineY - 10;
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