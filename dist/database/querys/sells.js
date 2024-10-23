"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellsQuery = void 0;
exports.sellsQuery = {
    // Quote, Remission or Invoice.
    getDocFromSells: `
        SELECT [TipoDoc], [Folio], [Fecha], [Total], [Saldo], [FechaEntrega]
        FROM [dbo].[VENTAS]
        WHERE TipoDoc = @TipoDoc
        ORDER BY Folio
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,
    getQuote: `
        SELECT 
        [TipoDoc], 
        [Folio], 
        [Fecha], 
        [Total], 
        [Saldo], 
        [FechaEntrega],
        DATEDIFF(DAY, GETDATE(), [FechaEntrega]) AS ExpiredDays
        FROM [dbo].[VENTAS]
        WHERE TipoDoc = @TipoDoc AND Folio = @Folio
    `
};
//# sourceMappingURL=sells.js.map