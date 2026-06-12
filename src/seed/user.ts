import type { UserWebSessionInterface } from "../interface/user";

const mockUserSession: UserWebSessionInterface = {
    ServidorSQL: 'FAKE_SERVER',
    BaseSQL: 'FAKE_DB',
    UsuarioSQL: 'fake_user',
    PasswordSQL: 'fake_password',

    Id_UsuarioOOL: 'UOOL123',
    Id_UsuarioOLEI: 'UOLEI456',
    PasswordOOL: 'fakePassword123',

    Nombre: 'Juan Pruebas',
    SwImagenes: true,
    from: 'web',
    Id_ListPre: 1,
    Id_Almacen: 10,
    Id_Cliente: 100,
    Id_Usuario: 'USR789',

    TipoUsuario: 'admin',
    Vigencia: '2025-12-31',
    TipoDocOO: 2,

    SwSinStock: false,
    SwsinPrecio: true,
    IsEmploye: true,
    InformesIAE: false,
    InformesIAR: false,
    InformesIAW : false
};

export {
    mockUserSession
}