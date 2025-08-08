

export const buildWhereCondition = <
    T extends Record<string, any>
>(
    filters?: Partial<Record<keyof T, any>>,
    containsFields: (keyof T)[] = []
): Partial<T> => {
    const where: Record<string, any> = {};

    for (const key in filters) {
        const value = filters[key as keyof T];

        if (value !== undefined && value !== null) {
            if (containsFields.includes(key as keyof T) && typeof value === "string") {
                where[key] = { contains: value };
            } else {
                where[key] = value;
            }
        }
    }

    return where as Partial<T>;
};

