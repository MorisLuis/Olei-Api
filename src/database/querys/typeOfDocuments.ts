

export const typeOfDocumentsQuery = {

    getTypeOfDocuments: `
        SELECT [TipoDoc] ,[Nombre]
        FROM [dbo].[TIPODOCS]
        WHERE TipoDoc IN (1,2,3)
    `

}