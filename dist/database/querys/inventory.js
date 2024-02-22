"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryQuerys = void 0;
exports.inventoryQuerys = {
    // Inventory
    getInventory: `SELECT I.Folio, I.Fecha FROM [dbo].[INVENTARIOS] I WHERE I.Folio = @Folio`,
    insertInventory: ` 
            INSERT INTO [dbo].[INVENTARIOS]  (
                Id_Almacen, Folio, Id_TipoMovInv, Estado, Fecha, Id_AlmacenDest, SwPendiente, Descripcion, Id_Usuario, SwTr, FechaRecepcion, FolioReq, AlmReq
            ) 
            OUTPUT 'Inventory' as 'result', Inserted.Id_Almacen, Inserted.Folio, Inserted.Fecha, Inserted.Id_TipoMovInv 
            VALUES (
                @Id_Almacen, @Folio, @Id_TipoMovInv, @Estado, @Fecha, @Id_AlmacenDest, @SwPendiente, @Descripcion, @Id_Usuario, @SwTr, @FechaRecepcion, @FolioReq, @AlmReq
            )
        `,
    getInventoryDetails: `SELECT I.Folio, TRIM(I.Codigo) AS Codigo, I.Cantidad, I.Partida FROM [dbo].[DETALLEINVENTARIOS] I  WHERE I.Folio = @Folio`,
    insertInventoryDetails: ` 
            INSERT INTO [dbo].[DETALLEINVENTARIOS] (
                Id_Almacen, Folio, Partida, Codigo, Id_Marca, Cantidad, Id_Ubicacion, Diferencia, SwNS, NumsDeSerie, SKU
            ) 
            OUTPUT 'output' as 'result', Inserted.Id_Almacen, Inserted.Folio, Inserted.Partida, Inserted.Codigo 
            VALUES (
                @Id_Almacen, @Folio, @Partida, @Codigo, @Id_Marca, @Cantidad, @Id_Ubicacion, @Diferencia, @SwNS, @NumsDeSerie, @SKU
            )
        `,
};
//# sourceMappingURL=inventory.js.map