
export interface UserSessionInterface {
    ServidorSQL: string;
    BaseSQL: string;
    UsuarioSQL: string;
    PasswordSQL: string;

    IdUsuarioOLEI: string;
    PasswordOLEI?: string;

    RazonSocial: string;
    SwImagenes: string | null;
    Vigencia: string;
    userId?: string;
    userRol?: string;
    from: 'web' | 'mobil' | 'crm',
    TodosAlmacenes?: number;
    Id_ListPre?: number;
    SalidaSinExistencias?: number
    Id_Almacen?: number;
    AlmacenNombre?: string;
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

// Interface result of: sp_AuthenticateAndGetMovement
export interface UserAuthenticateAndGetMovementResultInterface {
    Id_Perfil: string,
    Id_Almacen: number,
    TodosAlmacenes: number,
    Id_ListPre: number,
    InventarioW: number,
    TraspasosW: number,
    Descripcion: string,
    Id_TipoMovInv: number,
    Id_AlmDest: number,
    Accion: number,
    AlmacenNombre: string,
    SalidaSinExistencias: number
}

// Interface result of query: authDatabase
export interface authResultInterface {
    IdOLEI: number,
    PasswordOLEI: number,
    IdUsuarioOLEI: string,
    ServidorSQL: string,
    BaseSQL: string,
    UsuarioSQL: string,
    PasswordSQL: string,
    RazonSocial: string,
    SwImagenes: string | null,
    Vigencia: string
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