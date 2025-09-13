import dayjs from 'dayjs';
import type { BuildFiltersResponse } from './filterFunction';

export function appendDateFilter(
    where: BuildFiltersResponse,
    field: string,
    startDate?: string,
    endDate?: string,
    exactlyDate?: string
) : void {
    if (!startDate && !endDate && !exactlyDate) return;

    const dateFilter: { [key: string]: Record<string, unknown> } = { [field]: {} };

    if (exactlyDate) {
        const start = dayjs(exactlyDate).startOf('day').toDate();
        const end = dayjs(exactlyDate).endOf('day').toDate();
        dateFilter[field].gte = start;
        dateFilter[field].lte = end;
    } else {
        if (startDate) dateFilter[field].gte = dayjs(startDate).startOf('day').toDate();
        if (endDate) dateFilter[field].lte = dayjs(endDate).endOf('day').toDate();
    }

    where.AND = [...(where.AND || []), dateFilter];
}
