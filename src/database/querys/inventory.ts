export const inventoryQuerys = {

    getInventory: `
        SELECT 
        I.Folio, 
        I.Fecha 
        FROM [dbo].[INVENTARIOS] I 
        WHERE I.Folio = @Folio
    `,

    getInventoryDetails: `
        SELECT 
        I.Folio, 
        TRIM(I.Codigo) AS Codigo, 
        I.Cantidad, 
        I.Partida 
        FROM [dbo].[DETALLEINVENTARIOS] I  
        WHERE I.Folio = @Folio
    `,

}