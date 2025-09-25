"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abonosQuery = void 0;
exports.abonosQuery = {
    getAbonoDetails: `
        SELECT 
            DA.Folio,
            DA.TipoDoc,
            V.Fecha,
            V.Saldo,
            V.Total
        FROM [dbo].[DETALLEABONOS] DA
        JOIN [dbo].[VENTAS] V 
        ON V.Folio = DA.Folio 
        AND V.Id_Almacen = DA.Id_Almacen
        WHERE V.Folio = @Folio
        ORDER BY V.Fecha DESC
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    `
};
//# sourceMappingURL=abonos.js.map