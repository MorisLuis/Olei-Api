"use strict";
/* import { ClientInterface } from "../interface/client";

interface UserData {
    Id_UsuarioOOL: string;
    TipoUsuario: number;
    PrivilegioTipoCliente: number;
    Id_Almacen: number,
    SwImagenes: boolean,
    SwSinStock: boolean,
    SwsinPrecio: boolean,
    TipoDocOO: number,
    IdOLEI: number,
    Company: string;

    Id_ListPre: number;
}

const userStorage: { [userId: string]: UserData } = {};

export const getUserDataWeb = (userId: string): UserData | undefined => {
    return userStorage[userId.toLowerCase().trim()];
};

export const setUserDataWeb = (userId: string, data: UserData): void => {
    userStorage[userId.toLowerCase().trim()] = data;
};

export const removeUserDataWeb = (userId: string): void => {
    delete userStorage[userId.toLowerCase().trim()];
};



//Client data.
const clientStorage: { [clientId: string]: ClientInterface } = {};

export const getClientData = (clientId: string): ClientInterface | undefined => {
    return clientStorage[clientId.toLowerCase().trim()];
};

// The id is like: `${baseWeb}_${Id_Cliente}`
export const setClientData = (clientId: string, data: ClientInterface): void => {
    clientStorage[clientId.toLowerCase().trim()] = data;
};

export const removeClientData = (clientId: string): void => {
    delete clientStorage[clientId.toLowerCase().trim()];
};
 */ 
//# sourceMappingURL=storageWeb.js.map