

export const typeOfDocumentsQuery = {

    getTypeOfDocuments: `
        SELECT [TipoDoc] ,[Nombre]
        FROM [dbo].[TIPODOCS]
        WHERE TipoDoc IN (2,3,4)
    `

}