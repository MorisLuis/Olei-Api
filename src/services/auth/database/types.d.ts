import type { UserSessionInterface } from "../../../interface/user";

export interface LoginDbParams {
    IdUsuarioOLEI: string;
    PasswordOLEI: string;
}

export interface LoginDbResponse {
    user: Partial<UserSessionInterface>;
    tokenServer: string;
}

type LoginDbSessionFields = Required<
    Pick<
        UserSessionInterface,
        | "ServidorSQL"
        | "BaseSQL"
        | "UsuarioSQL"
        | "PasswordSQL"
        | "IdUsuarioOLEI"
        | "PasswordOLEI"
        | "RazonSocial"
        | "SwImagenes"
        | "Vigencia"
        | "Id_ListPre"
    >
>;