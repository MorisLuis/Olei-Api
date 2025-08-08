import type { Prisma } from "@prisma/client";

export function buildOrder<T extends Record<string, any>>(
    order: { field: keyof T; direction: Prisma.SortOrder },
    defaultField: keyof T
): T {
    if (order?.field && order?.direction) {
        return { [order.field]: order.direction } as T;
    }
    return { [defaultField]: 'asc' } as T;
}
