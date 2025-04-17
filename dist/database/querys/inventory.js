"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryQuerys = void 0;
exports.inventoryQuerys = {
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
};
//# sourceMappingURL=inventory.js.map