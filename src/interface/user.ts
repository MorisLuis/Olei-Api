
export default interface UserInterface {

    //  The identifier for the warehouse where the products are distributed.
    Id_Almacen: number;

    // The name of the user company.
    Nombre: string;

    // The name of the company.
    Company: string,

    // The ID of the price list that defines the prices of the products.
    Id_ListPre?: number | null;

    // The identifier of the client.
    Id_Cliente: number;

    // The unique identifier for database access.
    Id_UsuarioOOL: string;

    // The password for database access.
    PasswordOOL: string;

    // The SQL server name or address.
    ServidorSQL: string;

    // The name of the SQL database.
    BaseSQL: string;

    // Represents whether the user is an employee or a direct client. (1) Represent client and (2) represent employee
    TipoUsuario: number;

    // Represents some privileges associated with the user.
    PrivilegioTipoCliente: number;

    PrecioIncIVA: number;

    // Represent if the images are available (1).
    SwImagenes: 0 | 1;

    // Represent if show the products without stock (1)
    SwSinStock: 0 | 1;

    // Represent if show the products without price (1)
    SwsinPrecio: 0 | 1;

    //
    TipoDocOO: number;

    // This field is currently not in use.
    Id_UsuarioOLEI: number | null;
    PasswordOLEI: number | null;
    Id_ClienteDBCLIENTES: number | null;
}