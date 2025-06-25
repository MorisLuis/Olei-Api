import { User, fetchUser } from "./userApi";

// userService.ts
export const saveUser = (name: string) => {
    // aquí normalmente guardarías en la base de datos
    console.log('Saving to DB: ', name);
};

export const getUserGreeting = async (id: number): Promise<string> => {
    const user: User = await fetchUser(id);
    return `Hola ${user.name}!`;
};

export const createUser = async (name: string) => {
    // Aquí harías lógica DB real, por ejemplo insertar en tabla Users
    return { id: 99, name };
};