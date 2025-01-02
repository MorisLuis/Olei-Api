"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryQuerys = void 0;
exports.inventoryQuerys = {
    insertInventory: ` 
        INSERT INTO [dbo].[INVENTARIOS]  (
            Id_Almacen, Folio, Id_TipoMovInv, Estado, Fecha, Id_AlmacenDest, SwPendiente, Descripcion, Id_Usuario, SwTr, FechaRecepcion, FolioReq, AlmReq
        ) 
        OUTPUT 'Inventory' as 'result', Inserted.Id_Almacen, Inserted.Folio, Inserted.Fecha, Inserted.Id_TipoMovInv 
        VALUES (
            @Id_Almacen, @Folio, @Id_TipoMovInv, @Estado, @Fecha, @Id_AlmacenDest, @SwPendiente, @Descripcion, @Id_Usuario, @SwTr, @FechaRecepcion, @FolioReq, @AlmReq
        )
    `,
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