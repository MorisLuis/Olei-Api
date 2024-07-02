interface UserData {
    Id_TipoMovInv?: {
        Id_TipoMovInv: number;
        Accion: number;
        Descripcion: string;
        Id_AlmDest: number;
    };
}

const userStorage: { [userId: string]: UserData } = {};

export const getUserData = (userId: string): UserData | undefined => {
    return userStorage[userId.toLowerCase().trim()];
};

export const setUserData = (userId: string, data: UserData): void => {
    userStorage[userId.toLowerCase().trim()] = data;
};

export const removeUserData = (userId: string): void => {
    delete userStorage[userId.toLowerCase().trim()];
};


interface clientData {
    RazonSocial?: string;
    SwImagenes?: boolean;
    Vigencia?: string;
}

const clientStorage: { [clientId: string]: clientData } = {};

export const getClienteData = (clientId: string): clientData | undefined => {
    return clientStorage[clientId.toLowerCase().trim()];
};

export const setClienteData = (clientId: string, data: clientData): void => {
    clientStorage[clientId.toLowerCase().trim()] = data;
};

export const removeClienteData = (clientId: string): void => {
    delete clientStorage[clientId.toLowerCase().trim()];
};
