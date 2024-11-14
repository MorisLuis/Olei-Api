
export const bitacoraQuerys = {

    getMeetings: `
        SELECT Id_Bitacora,
            Id_Almacen,
            Id_Cliente,
            Fecha,
            Descripcion,
            TipoContacto
        FROM dbo.BITACORACRM
        WHERE
        (@WhereCondition != 'Cliente' OR (Id_Cliente = @Id_Cliente AND @WhereCondition = 'Cliente'))
        AND (@WhereCondition != 'TipoContacto' OR (TipoContacto = @TipoContacto AND @WhereCondition = 'TipoContacto'))
        ORDER BY 
        CASE WHEN @OrderCondition = 'Cliente' THEN Id_Cliente END DESC,
        CASE WHEN @OrderCondition = 'Fecha' THEN Fecha END DESC,
        CASE WHEN @OrderCondition = 'TipoContacto' THEN TipoContacto END DESC,
        Id_Bitacora
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    `,

    getMeetingById: `
        SELECT [Id_Bitacora], [Id_Almacen] ,[Id_Cliente] ,[Fecha] ,[Descripcion] ,[TipoContacto]
        FROM [dbo].[BITACORACRM]
        WHERE Id_Bitacora = @Id_Bitacora
    `,

    insertMeeting: `
        INSERT INTO [dbo].[BITACORACRM] (Id_Almacen, Id_Cliente, Fecha, Descripcion, TipoContacto)
        OUTPUT 
            INSERTED.Id_Bitacora, 
            INSERTED.Id_Almacen,
            INSERTED.Id_Cliente,
            INSERTED.Fecha,
            INSERTED.Descripcion,
            INSERTED.TipoContacto
        VALUES (@Id_Almacen, @Id_Cliente, @Fecha, @Descripcion, @TipoContacto)
    `,

    updateMeeting: `
        UPDATE [dbo].[BITACORACRM]
        SET 
            [Fecha] = COALESCE(@Fecha, [Fecha]),
            [Descripcion] = COALESCE(@Descripcion, [Descripcion]),
            [TipoContacto] = COALESCE(@TipoContacto, [TipoContacto])
        OUTPUT 
            INSERTED.Id_Bitacora,
            INSERTED.Fecha,
            INSERTED.Descripcion,
            INSERTED.TipoContacto
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