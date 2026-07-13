import type { UserSessionInterface } from "../../../interface/user";

export interface LoginAppParams {
    sessionId: string;
    session: UserSessionInterface;
    Id_Usuario: string;
    password: string;
};

export interface LoginAppResponse {
    user: Partial<UserSessionInterface>;
    token: string;
    refreshToken: string;
}


export type LoginAppSessionFields = Required<
    Pick<
        UserSessionInterface,
        | "Id_Almacen"
        | "TodosAlmacenes"
        | "Id_ListPre"
        | "AlmacenNombre"
        | "SalidaSinExistencias"
        | "Id_Perfil"
    >
>;

export type ValidationResult = {
    Tipo: 'usuario' | 'contrasena';
    Resultado: number;
};


export interface logoutAppParams {
    sessionId: string;
    session: UserSessionInterface;
}

export interface logoutAppResponse {
    user: Partial<UserSessionInterface>;
}


export interface refreshAppParams {
    sessionId: string;
    session: UserSessionInterface;
}

export interface refreshAppResponse {
    user: Partial<UserSessionInterface>;
    token: string;
    refreshToken: string;
}