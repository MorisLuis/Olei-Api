export default interface UserInterface {

    Id_UsuarioOOL: string,
    PasswordOOL: string,
    ServidorSQL: string,
    BaseSQL: string,
    TipoUsuario: string,
    PrivilegioTipoCliente: number,
    Id_UsuarioOLEI: number | null,
    PasswordOLEI: number | null,
    Id_ClienteDBCLIENTES: number | null,
    Id_Cliente: number,
    Id_Almacen: number,
    Id_ListPre?: number | null
}