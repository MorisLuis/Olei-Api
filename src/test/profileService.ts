
export interface Profile {
    id: number;
    name: string;
    email: string;
}

export const getProfile = async (id: number): Promise<Profile> => {
    // lógica real para buscar perfil por id
    return { id, name: 'Dummy', email: 'dummy@example.com' };
};

export const deleteProfile = (id: number) => {
    // otra función...
};
