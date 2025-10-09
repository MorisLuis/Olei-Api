export const abonosQuery = {

    getAbonoDetails: `
        SELECT
            V.Folio,
            DA.TipoDoc,
            V.Fecha,
            DA.SaldoNuevo AS Saldo,
            DA.SaldoRef AS Total
        FROM [dbo].[DETALLEABONOS] DA
            JOIN [dbo].[VENTAS] V
            ON V.Folio = DA.FolioRef
                AND V.Id_Almacen = DA.Id_Almacen AND V.TipoDoc = DA.TipoDoc
        WHERE DA.Folio = @Folio
        ORDER BY V.Fecha DESC
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    `
}