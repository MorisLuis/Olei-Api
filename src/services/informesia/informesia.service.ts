import sql from 'mssql';

import redisClient from "../../config/redisClient";
import { dbConnectionWeb } from "../../database";
import { informesiaQuery } from "../../database/querys/informesia";
import { ValidationError } from "../../errors/CustomError";
import { errorResponse } from "../../helpers/response";
import type { GetInformesiaParams, PostInformesiaParams } from "./types";
import type { Response } from 'express';

const CATEGORIAS_MAP: Record<number, string> = {
    1: 'General',
    2: 'Compras',
    3: 'Cobranza',
    4: 'Ventas',
    5: 'Cuentas por Cobrar',
    6: 'Existencias e Inventario',
    7: 'Catalogo Productos',
    8: 'Catalogo Clientes'
};

type InformesiaRow = {
    ID?: number;
    Titulo: string;
    Categoria: number;
    Descripcion?: string | null;
    [key: string]: unknown;
};

type GroupedInformesia = {
    categoriaId: number;
    categoriaNombre: string;
    informes: InformesiaRow[];
};

const isPositiveInteger = (v: unknown) => Number.isInteger(v) && (v as number) > 0;


export const getInformesiaService = async ({
    userSession,
    PageNumber
}: GetInformesiaParams): Promise<GroupedInformesia[]> => {
    const { ServidorSQL, BaseSQL } = userSession;

    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = informesiaQuery.getInformesia;

    const { recordset } = await pool.request()
        .input('PageNumber', sql.Int, PageNumber)
        .input('PageSize', sql.Int, 10)
        .query(query);

    const agrupado = (recordset as InformesiaRow[]).reduce((acc, item) => {
        const categoriaId = Number(item.Categoria) || 0;
        const categoriaNombre = CATEGORIAS_MAP[categoriaId] ?? 'Sin categoría';

        if (!acc[categoriaId]) {
            acc[categoriaId] = {
                categoriaId,
                categoriaNombre,
                informes: []
            } as GroupedInformesia;
        }

        acc[categoriaId].informes.push(item);
        return acc;
    }, {} as Record<number, GroupedInformesia>);

    return Object.values(agrupado);
};

export const postInformesiaService = async ({
    userSession,
    body,
    queryId,
    res
}: PostInformesiaParams): Promise<{ success: boolean; message?: string } | Response> => {
    const { ServidorSQL, BaseSQL } = userSession;

    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    if (!queryId) {
        return errorResponse(res, 'queryId is required', 400) as Response;
    }

    const record = await redisClient.get(`agent:sql:${queryId}`);
    if (!record) {
        return errorResponse(res, 'Consulta no encontrada o expirada', 404);
    }

    let parsed: { sql?: string; request?: string } = {};
    try {
        parsed = JSON.parse(record);
    } catch (err) {
        return errorResponse(res, `Registro de consulta inválido: ${err instanceof Error ? err.message : String(err)}`, 400) as Response;
    }

    let { sql: sqlAgent = '', request: requestAgent = '' } = parsed;
    sqlAgent = sqlAgent.replace(/\boffset\s+\d+\s+rows\s+fetch\s+next\s+\d+\s+rows\s+only\s*;?/i, '');

    const { Titulo, Categoria, Descripcion } = body ?? {};

    if (!Titulo || typeof Titulo !== 'string' || Titulo.trim().length === 0) {
        return errorResponse(res, 'Titulo es obligatorio', 400) as Response;
    }
    if (Titulo.length > 255) {
        return errorResponse(res, 'Titulo excede 255 caracteres', 400) as Response;
    }
    const categoriaNum = Number(Categoria);
    if (!isPositiveInteger(categoriaNum) || !CATEGORIAS_MAP[categoriaNum]) {
        return errorResponse(res, 'Categoria inválida', 400) as Response;
    }

    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = informesiaQuery.postInformesia;

        await request
            .input('Titulo', sql.VarChar(255), Titulo.trim())
            .input('Categoria', sql.Int, categoriaNum)
            .input('Descripcion', sql.Text, Descripcion ?? null)
            .input('PeticionUsuario', sql.Text, requestAgent)
            .input('SQL', sql.Text, sqlAgent)
            .query(query);

        await transaction.commit();
        return { success: true };
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};