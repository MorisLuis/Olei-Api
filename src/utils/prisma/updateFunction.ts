
type DataReponse = Record<string, string | number | boolean | object>

export function buildUpdate(
    data: any,
    allowedFields?: string[]
) : DataReponse {
    // Si se especifican campos permitidos, filtramos
    const filteredData = allowedFields
        ? Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        )
        : data;

    return filteredData
}
