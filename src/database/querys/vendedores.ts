export const vendedoresQuery = {
    getVendedores: `
        SELECT
            [IdOLEI],
            [Id_Vendedor],
            [Nombre]
        FROM [dbo].[VENDEDORES]
        ORDER BY [Nombre], [Id_Vendedor]
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    `,

    getVendedoresCount: `
        SELECT COUNT(*) AS Total
        FROM [dbo].[VENDEDORES];
    `,

    getVendedorById: `
        SELECT
            [IdOLEI],
            [Id_Vendedor],
            [Nombre]
        FROM [dbo].[VENDEDORES]
        WHERE [Id_Vendedor] = @Id_Vendedor;
    `,
};
