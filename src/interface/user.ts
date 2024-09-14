export interface UserSessionInterface {
    serverclientes: string;
    baseclientes: string;
    PasswordSQL: string;
    UsuarioSQL: string;
    IdUsuarioOLEI: string;
    RazonSocial: string;
    SwImagenes: string;
    Vigencia: string;

    userId?: string;
    userRol?: string;
}

export interface UserWebSessionInterface {
    Id: string,
    Nombre: string,
    TipoUsuario: string,
    Serverweb: string,
    Baseweb: string,
    Id_Cliente: number,
    Id_ListPre: number,
    Vigencia: string,
    SwImagenes: boolean, 
    SwSinStock: boolean, 
    SwsinPrecio: boolean, 
    TipoDocOO: number,
    Id_Almacen: number,
    PrecioIncIVA: number,
    Id_Usuario: string,
    IsEmploye?: boolean
}

export type ValidationResult = {
    Tipo: 'usuario' | 'contrasena';
    Resultado: number;
};

export type MovementDetail = {
    Id_Perfil: number;
    InventarioW: boolean;
    TraspasosW: boolean;

    //Type of movement
    Descripcion: string;
    Id_TipoMovInv: number;
    Accion: number;
    Id_AlmDest: number;
};