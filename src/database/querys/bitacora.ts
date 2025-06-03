
export const bitacoraQuerys = {

    getMeetings: `
        WITH
            MEETINGS_CTE
            AS
            (
                SELECT 
                    B.Id_Bitacora,
                    C.Nombre,
                    B.Id_Almacen,
                    B.Id_Cliente,
                    B.Fecha,
                    B.Descripcion,
                    B.TipoContacto,
                    B.Hour,
                    B.HourEnd
                FROM dbo.BITACORACRM B
                JOIN [dbo].[CLIENTES] C ON C.Id_Cliente = B.Id_Cliente AND C.Id_Almacen = B.Id_Almacen
                WHERE (@FilterCliente = 0 OR (B.Id_Cliente = @Id_Cliente AND @FilterCliente = 1))
                    AND (@FilterTipoContacto = 0 OR (TipoContacto = @TipoContacto AND @FilterTipoContacto = 1))
                    AND (C.Nombre LIKE '%' + ISNULL(@searchTerm, '') + '%')
            )
        SELECT *
        FROM MEETINGS_CTE
        ORDER BY 
            CASE
                WHEN @OrderCondition = 'Cliente' THEN Id_Cliente
                WHEN @OrderCondition = 'Fecha' THEN Fecha
                WHEN @OrderCondition = 'TipoContacto' THEN TipoContacto
                END DESC,
                CASE 
                WHEN @OrderCondition = 'Cliente' THEN Fecha 
                WHEN @OrderCondition = 'TipoContacto' THEN Fecha
            END DESC,
            Fecha DESC,
            TipoContacto
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getTotalMeetings: `
        SELECT COUNT(*) AS TotalCount
        FROM dbo.BITACORACRM B
        JOIN [dbo].[CLIENTES] C ON C.Id_Cliente = B.Id_Cliente AND C.Id_Almacen = B.Id_Almacen
        WHERE
        (@FilterCliente = 0 OR (B.Id_Cliente = @Id_Cliente AND @FilterCliente = 1))
        AND (@FilterTipoContacto = 0 OR (TipoContacto = @TipoContacto AND @FilterTipoContacto = 1))
        AND (C.Nombre LIKE '%' + ISNULL(@searchTerm, '') + '%')
    `,

    getMeetingById: `
        SELECT
        [Id_Almacen]
        ,[Id_Cliente]
        ,[Fecha]
        ,[Descripcion]
        ,[TipoContacto]
        ,[Id_Bitacora]
        ,[Titulo]
        ,[Hour]
        ,[HourEnd]
        ,[Comentarios]
        FROM [dbo].[BITACORACRM]
        WHERE Id_Bitacora = @Id_Bitacora
    `,

    insertMeeting: `
        INSERT INTO [dbo].[BITACORACRM] (Id_Almacen, Id_Cliente, Fecha, Descripcion, TipoContacto, Hour, HourEnd, Titulo, Comentarios)
        OUTPUT 
            INSERTED.Id_Bitacora, 
            INSERTED.Id_Almacen,
            INSERTED.Id_Cliente,
            INSERTED.Fecha,
            INSERTED.Descripcion,
            INSERTED.TipoContacto
        VALUES (@Id_Almacen, @Id_Cliente, @Fecha, @Descripcion, @TipoContacto, @Hour, @HourEnd, @Titulo, @Comentarios)
    `,

    updateMeeting: `
        UPDATE [dbo].[BITACORACRM]
        SET 
            [Fecha] = COALESCE(@Fecha, [Fecha]),
            [Descripcion] = COALESCE(@Descripcion, [Descripcion]),
            [TipoContacto] = COALESCE(@TipoContacto, [TipoContacto]),
            [Hour] = COALESCE(@Hour, [Hour]),
            [HourEnd] = COALESCE(@HourEnd, [HourEnd]),
            [Titulo] = COALESCE(@Titulo, [Titulo]),
            [Comentarios] = COALESCE(@Comentarios, [Comentarios])
        OUTPUT 
            INSERTED.Id_Bitacora,
            INSERTED.Fecha,
            INSERTED.Descripcion,
            INSERTED.TipoContacto,
            INSERTED.Hour,
            INSERTED.Titulo,
            INSERTED.Comentarios
        WHERE Id_Bitacora = @Id_Bitacora    
    `,

    deleteMeeting: `
        DELETE FROM [dbo].[BITACORACRM]
        OUTPUT 
            DELETED.Id_Bitacora,
            DELETED.Fecha,
            DELETED.Descripcion,
            DELETED.TipoContacto
        WHERE [Id_Bitacora] = @Id_Bitacora;
    `
}