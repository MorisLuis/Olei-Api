import type { Response } from "express";
import type { UserWebSessionInterface } from "../../interface/user";

interface GetInformesiaParams {
    userSession: UserWebSessionInterface;
    PageNumber: number;
}

interface PostInformesiaParams {
    userSession: UserWebSessionInterface;
    body: {
        Titulo: string;
        Categoria: number;
        Descripcion?: string;
    };
    queryId: string;
    res: Response;
}