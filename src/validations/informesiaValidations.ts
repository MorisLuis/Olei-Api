import z from "zod";



export const postInformesiaValidations = z.object({
    Titulo: z.string().min(1, { message: "El título es obligatorio" }),
    Categoria: z.number().int().positive({ message: "La categoría debe ser un número positivo" }),
    Descripcion: z.string().optional()
})


export const postInformesiaParamsValidations = z.object({
    queryId: z.string().uuid({ message: "El queryId debe ser un UUID válido" })
})