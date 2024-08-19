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
