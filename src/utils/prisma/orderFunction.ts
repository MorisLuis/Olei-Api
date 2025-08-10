
export function buildOrder<T extends Record<string, string | number | object | boolean>>(
    order: { field: string, direction: string },
    defaultField: keyof T
): T {

    if (order?.field && order?.direction) {
        return { [order.field]: order.direction } as T;
    }
    return { [defaultField]: 'asc' } as T;
}
