export const informesiaQuery = {

    getInformesia: `
        SELECT [Id_InformeIA]
            ,[Titulo]
            ,[Categoria]
            ,[Descripcion]
            ,[PeticionUsuario]
            ,[SQL]
        FROM [dbo].[INFORMESIA]
        ORDER BY [Id_InformeIA]
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    `,

    postInformesia: `
        DECLARE @NextId int;
        
        SELECT @NextId = ISNULL(MAX(Id_InformeIA), 0) + 1
        FROM dbo.INFORMESIA
        WITH (UPDLOCK, HOLDLOCK);
        
        INSERT INTO dbo.INFORMESIA
        (
            Id_InformeIA,
            Titulo,
            Categoria,
            Descripcion,
            PeticionUsuario,
            SQL
        )
        VALUES
        (
            @NextId,
            @Titulo,
            @Categoria,
            @Descripcion,
            @PeticionUsuario,
            @SQL
        );
    
    `

}