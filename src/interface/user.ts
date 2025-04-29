
export interface UserSessionInterface {
    ServidorSQL: string;
    BaseSQL: string;
    UsuarioSQL: string;
    PasswordSQL: string;

    IdUsuarioOLEI: string;
    PasswordOLEI?: number;

    RazonSocial: string;
    SwImagenes: string | null;
    Vigencia: string;
    from: 'web' | 'mobil' | 'crm',
    serverConected: boolean;
    userConected: boolean;

    userId?: string;
    userRol?: string;
    TodosAlmacenes?: number;
    SalidaSinExistencias?: number
    Id_Almacen?: number;
    Id_ListPre?: number;
    AlmacenNombre?: string;
}

export interface UserWebSessionInterface {
    ServidorSQL: string,
    BaseSQL: string,
    UsuarioSQL: string,
    
    Id_UsuarioOOL: string,
    Id_UsuarioOLEI: string,
    PasswordOOL: string,
    
    Nombre: string,
    SwImagenes: boolean,
    from: 'web' | 'mobil' | 'crm',
    Id_ListPre: number,
    Id_Almacen: number,
    Id_Cliente: number,
    Id_Usuario: string,

    TipoUsuario: string,
    Vigencia: string,
    TipoDocOO: number,
    
    //PrecioIncIVA: number,
    //Id: string, // revisar

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
    Vigencia: string,
    Id_ListPre: number;
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