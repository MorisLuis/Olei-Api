
export const costosQuerys = {

    updateCostos : `
        UPDATE [dbo].[COSTOS]
        SET CodBar=@CodBar
        WHERE Codigo=@Codigo AND Id_Marca=@Id_Marca
    `

}