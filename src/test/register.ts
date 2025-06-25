// register.ts

import { saveUser } from "./userService";

export const register = (name: string) => {
    saveUser(name);
    return 'registered';
};
