// userApi.ts
export interface User {
    id: number;
    name: string;
}

export const fetchUser = async (id: number): Promise<User> => {
    // Simulación de llamada real – aquí harías fetch/axios/etc.
    const res = await fetch(`https://my-cool-api.io/users/${id}`);
    if (!res.ok) throw new Error('API fail');
    return (await res.json()) as User;
};
