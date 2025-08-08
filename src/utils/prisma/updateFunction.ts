
export function buildUpdate(
    data: Record<string, any>,
    allowedFields?: string[]
) {
    // Si se especifican campos permitidos, filtramos
    const filteredData = allowedFields
        ? Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        )
        : data;

    return filteredData
}
