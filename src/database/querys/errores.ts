

export const erroresQuerys = {

    postError: `
        INSERT INTO [dbo].[ERRORES]
        ( [From], [Message], Id_Usuario, Fecha, Metodo, code )
        VALUES
        ( @From, @Message, @Id_Usuario, @Fecha, @Metodo, @code )
    `
}