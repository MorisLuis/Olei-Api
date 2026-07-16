export const usersQuery = {
    updateUserSession: `
        UPDATE  [dbo].[USUARIOS] 
        SET SwActivo = 0
        WHERE Id_Usuario = @Id_Usuario
    `
}