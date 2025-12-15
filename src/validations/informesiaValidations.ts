import z from "zod";



export const postInformesiaValidations = z.object({
    Titulo: z.string().min(1, { message: "El título es obligatorio" }),
    Categoria: z.number().int().positive({ message: "La categoría debe ser un número positivo" }),
    Descripcion: z.string().optional(),
    PeticionUsuario: z.string().optional(),
    SQL: z.string().min(1, { message: "El SQL es obligatorio" }),
})