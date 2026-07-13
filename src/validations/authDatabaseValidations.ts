import { z } from 'zod';

export const loginServerBodySchema = z.object({
    IdUsuarioOLEI: z.string().trim().min(1, 'IdUsuarioOLEI es requerido').max(100),
    PasswordOLEI: z.string().trim().min(1, 'PasswordOLEI es requerido').max(200),
});

export const loginAppBodySchema = z.object({
    Id_Usuario: z.string().trim().min(1, 'Id_Usuario es requerido').max(50),
    password: z.string().trim().min(1, 'password es requerido').max(50),
});

export const refreshAppBodySchema = z.object({
    refreshToken: z.string().trim().min(1, 'refreshToken es requerido'),
});
