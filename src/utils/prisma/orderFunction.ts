
export function buildOrder<T extends Record<string, any>>(
    order: { field: string; direction: 'asc' | 'desc' },
    defaultField: keyof T
): T {
    if (order?.field && order?.direction) {
        if (order.field.includes('.')) {
            // ejemplo: "cliente.Nombre"
            const [relation, field] = order.field.split('.');
            return {
                [relation]: {
                    [field]: order.direction,
                },
            } as T;
        }

        return { [order.field]: order.direction } as T;
    }

    return { [defaultField]: 'asc' } as T;
}
