
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
    from: 'web' | 'mobil' | 'crm',
}

export interface UserWebSessionInterface {
    Id: string,
    Nombre: string,
    Serverweb: string,
    Baseweb: string,

    TipoUsuario: string,
    Id_Cliente: number,
    Id_ListPre: number,
    Vigencia: string,
    TipoDocOO: number,
    Id_Almacen: number,
    PrecioIncIVA: number,
    Id_Usuario: string,
    SwImagenes: boolean, 
    from: 'web' | 'mobil' | 'crm',

    // Online
    SwSinStock: boolean, 
    SwsinPrecio: boolean, 
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