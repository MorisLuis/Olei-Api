export const getTenantsQuery = (parameterNames: string[]): string => `
    SELECT
        Id_Cliente,
        ServidorSQL,
        BaseSQL
    FROM [dbo].[CLIENTES]
    WHERE Id_Cliente IN (${parameterNames.map(name => `@${name}`).join(', ')})
`;
