import { ClientInterface } from "../interface/client";
import { ConnectionInterface } from "../interface/connection";
import UserInterface from "../interface/user";


export const currentUserTest: { user: UserInterface } = {

    user: {
        Id_Almacen: 1,
        Nombre: "Morado",
        Company: "OLEI TEST",
        Id_ListPre: 1,
        Id_Cliente: 1,
        Id_UsuarioOOL: process.env.DB_USER || "",
        PasswordOOL: process.env.DB_PASSWORD || "",
        ServidorSQL: process.env.DB_SERVER || "",
        BaseSQL: process.env.DB_DATABASE || "",

        // Represents whether the user is an employee or a direct client. (1) Represent client and (2) represent employee
        TipoUsuario: 1,
        PrivilegioTipoCliente: 1,
        PrecioIncIVA: 0,

        // Represent if the images are available (1).
        SwImagenes: 1,

        // Represent if show the products without stock (1)
        SwSinStock: 1,

        // Represent if show the products without price (1)
        SwsinPrecio: 1,
        RazonSocial: "RAZON DE PRUEBA",
        TipoDocOO: 0,
        IdOLEI: 1,

        //Id_UsuarioOLEI: null,
        //PasswordOLEI: null,
        //Id_ClienteDBCLIENTES: null,
        Id_TipoMovInv: {
            Id_TipoMovInv: 0,
            Accion: 0,
            Descripcion: "Inventario",
            Id_AlmDest: 1
        }
    }
}

export const currentClientTest: { client: ClientInterface } = {
    client: {
        Id_Almacen: 1,
        Id_ListPre: 1,
        Id_Cliente: 3,
        Id_AlmDest: 1
    }
}


export const userConnectionTest: { connection: ConnectionInterface } = {

    connection: {
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
        server: process.env.DB_SERVER || "",
        database: process.env.DB_DATABASE || "",
    }
}