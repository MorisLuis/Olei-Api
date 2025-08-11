export const buildWhereCondition = <
    T extends Record<string, string | number | boolean | object>
>(
    filters?: Partial<T>,
    containsFields: (Extract<keyof T, string>)[] = []
): Partial<T> => {
    const where: Partial<T> = {};

    for (const key in filters) {
        const value = filters[key as keyof T];

        if (value !== undefined && value !== null) {
            if (
                containsFields.includes(key as Extract<keyof T, string>) &&
                typeof value === "string"
            ) {
                where[key as keyof T] = { contains: value } as T[keyof T];
            } else {
                where[key as keyof T] = value;
            }
        }
    }

    return where;
};
