const abonosFrom = `
    FROM dbo.ABONOS A
    LEFT JOIN dbo.CLIENTES C
        ON C.Id_Almacen = A.Id_AlmacenClte AND C.Id_Cliente = A.Id_Cliente
    LEFT JOIN dbo.FORMASDEPAGO F
        ON F.Id_Formapago = A.Id_FormaPago
`;

const abonosWhere = `
    WHERE (@StartDate IS NULL OR A.Fecha >= @StartDate)
        AND (@EndDate IS NULL OR A.Fecha <= @EndDate)
        AND (@Folio IS NULL OR A.Folio = @Folio)
        AND (@FilterIdAlmacen IS NULL OR A.Id_Almacen = @FilterIdAlmacen)
        AND (@FilterIdCliente IS NULL OR A.Id_Cliente = @FilterIdCliente)
        AND (@ClienteNombre IS NULL OR C.Nombre LIKE '%' + @ClienteNombre + '%')
        AND (@ClienteRazonSocial IS NULL OR C.RazonSocial LIKE '%' + @ClienteRazonSocial + '%')
        AND (@ClienteRFC IS NULL OR C.RFC LIKE '%' + @ClienteRFC + '%')
        AND (@FormaPagoNombre IS NULL OR F.Nombre LIKE '%' + @FormaPagoNombre + '%')
`;

export const abonosQuery = {
    getAbonos: `
        SELECT A.Folio, A.Id_Almacen, A.Id_Cliente, A.Id_FormaPago, A.Importe, A.Fecha,
            C.Nombre AS ClienteNombre, F.Nombre AS FormaPagoNombre
        ${abonosFrom}
        ${abonosWhere}
        ORDER BY
            CASE WHEN @OrderField = 'Folio' AND @OrderDirection = 'asc' THEN A.Folio END ASC,
            CASE WHEN @OrderField = 'Folio' AND @OrderDirection = 'desc' THEN A.Folio END DESC,
            CASE WHEN @OrderField = 'Fecha' AND @OrderDirection = 'asc' THEN A.Fecha END ASC,
            CASE WHEN @OrderField = 'Fecha' AND @OrderDirection = 'desc' THEN A.Fecha END DESC,
            CASE WHEN @OrderField = 'Id_Cliente' AND @OrderDirection = 'asc' THEN A.Id_Cliente END ASC,
            CASE WHEN @OrderField = 'Id_Cliente' AND @OrderDirection = 'desc' THEN A.Id_Cliente END DESC,
            CASE WHEN @OrderField = 'cliente.Nombre' AND @OrderDirection = 'asc' THEN C.Nombre END ASC,
            CASE WHEN @OrderField = 'cliente.Nombre' AND @OrderDirection = 'desc' THEN C.Nombre END DESC,
            CASE WHEN @OrderField = 'forma_de_pago.Nombre' AND @OrderDirection = 'asc' THEN F.Nombre END ASC,
            CASE WHEN @OrderField = 'forma_de_pago.Nombre' AND @OrderDirection = 'desc' THEN F.Nombre END DESC
        OFFSET @Skip ROWS FETCH NEXT @Limit ROWS ONLY;
    `,

    getAbonosCount: `
        SELECT COUNT(*) AS Total
        ${abonosFrom}
        ${abonosWhere};
    `,

    getAbonoById: `
        SELECT A.Folio, A.Id_Almacen, A.Id_Cliente, A.Id_FormaPago, A.Importe, A.Fecha,
            C.Nombre AS ClienteNombre, F.Nombre AS FormaPagoNombre
        ${abonosFrom}
        WHERE A.Id_Almacen = @Id_Almacen AND A.Folio = @Folio;
    `,

    getAbonoDetails: `
        SELECT V.Folio, DA.TipoDoc, V.Fecha, DA.SaldoNuevo AS Saldo, DA.SaldoRef AS Total
        FROM [dbo].[DETALLEABONOS] DA
            JOIN [dbo].[VENTAS] V
            ON V.Folio = DA.FolioRef
                AND V.Id_Almacen = DA.Id_Almacen AND V.TipoDoc = DA.TipoDoc
        WHERE DA.Folio = @Folio
        ORDER BY V.Fecha DESC
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    `,
};
