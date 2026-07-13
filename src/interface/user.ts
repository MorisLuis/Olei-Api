
export interface UserSessionInterface {
    // Client data
    ServidorSQL: string;
    BaseSQL: string;
    UsuarioSQL: string;
    PasswordSQL: string;
    IdUsuarioOLEI: string;
    PasswordOLEI?: string;
    RazonSocial: string;
    SwImagenes: boolean;
    Vigencia: Date;

    from: 'web' | 'mobil' | 'crm',
    serverConected: boolean;
    userConected: boolean;
    
    Id_Almacen?: number;
    TodosAlmacenes?: number;
    Id_ListPre?: number;
    SalidaSinExistencias?: number
    AlmacenNombre?: string;

    Id_UsuarioOLEI?: string;
    userRol?: number;
    Id_Perfil?: number;
}

export interface UserWebSessionInterface {
    ServidorSQL: string,
    BaseSQL: string,
    UsuarioSQL: string,
    PasswordSQL: string,

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

    InformesIAR: boolean,
    InformesIAE: boolean,
    InformesIAW: boolean,

    SwSinStock: boolean, 
    SwsinPrecio: boolean, 
    IsEmploye?: boolean
}



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