/*
===============================================================================
Procedure : dbo.sp_AuthenticateAndGetMovement

Purpose
-------
Authenticates a user, prevents multiple simultaneous sessions, marks the user
as active and returns the inventory movement types available to the user.
===============================================================================
*/

CREATE OR ALTER PROCEDURE [dbo].[sp_AuthenticateAndGetMovement]
    @Id_Usuario VARCHAR(50),
    @Password   VARCHAR(100),
    @IdEquipo   VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @SwActivo BIT;

    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT
        @SwActivo = ISNULL(U.SwActivo, 0)
    FROM dbo.USUARIOS AS U WITH (UPDLOCK, HOLDLOCK)
    WHERE U.Id_Usuario = @Id_Usuario
        AND U.[Password] = @Password;

        IF @SwActivo IS NULL
        BEGIN
            RAISERROR('Invalid username or password.', 16, 1);
        END

        IF @SwActivo = 1
        BEGIN
            RAISERROR('User already logged in.', 16, 1);
        END

    UPDATE dbo.USUARIOS
        SET
            SwActivo = 1,
            IdEquipo = COALESCE(@IdEquipo, IdEquipo)
        WHERE Id_Usuario = @Id_Usuario;

    EXEC dbo.fn_GetTypeOfMovement
            @Id_Usuario = @Id_Usuario,
            @Id_TipoMovInv = NULL;

    COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
    IF XACT_STATE() <> 0
        BEGIN
        ROLLBACK TRANSACTION;
    END

    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();

    RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END