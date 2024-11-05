
export const bitacoraQuerys = {

    getMeetings: `
        SELECT [Id_Bitacora], [Id_Almacen] ,[Id_Cliente] ,[Fecha] ,[Descripcion] ,[TipoContacto]
        FROM [dbo].[BITACORACRM]
        ORDER BY Fecha DESC
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getMeetingById: `
        SELECT [Id_Bitacora], [Id_Almacen] ,[Id_Cliente] ,[Fecha] ,[Descripcion] ,[TipoContacto]
        FROM [dbo].[BITACORACRM]
        WHERE Id_Bitacora = @Id_Bitacora
    `,

    insertMeeting: `
        INSERT INTO [dbo].[BITACORACRM] (Id_Almacen, Id_Cliente, Fecha, Descripcion, TipoContacto)
        VALUES (@Id_Almacen, @Id_Cliente, @Fecha, @Descripcion, @TipoContacto);
    `,

    updateMeeting: `
        UPDATE [dbo].[BITACORACRM]
        SET 
            [Fecha] = COALESCE(@Fecha, [Fecha]),
            [Descripcion] = COALESCE(@Descripcion, [Descripcion]),
            [TipoContacto] = COALESCE(@TipoContacto, [TipoContacto])
        WHERE Id_Bitacora = @Id_Bitacora
    `,

    deleteMeeting: `
        DELETE FROM [dbo].[BITACORACRM]
        WHERE [Id_Bitacora] = @Id_Bitacora;
    `
}