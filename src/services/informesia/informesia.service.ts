import { dbConnectionWeb } from "../../database";
import { informesiaQuery } from "../../database/querys/informesia";
import { ValidationError } from "../../errors/CustomError";
import type { UserWebSessionInterface } from "../../interface/user";
import sql from 'mssql';

interface GetInformesiaParams {
    userSession: UserWebSessionInterface;
    PageNumber: number;
}

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

export const getInformesiaService = async ({
    userSession,
    PageNumber
}: GetInformesiaParams) => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };


    const query = informesiaQuery.getInformesia;

    const { recordset } = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .query(query);

    const agrupado = recordset.reduce((acc, item) => {
        const categoriaId = item.Categoria;
        const categoriaNombre = CATEGORIAS_MAP[categoriaId] ?? 'Sin categoría';

        if (!acc[categoriaId]) {
            acc[categoriaId] = {
                categoriaId,
                categoriaNombre,
                informes: []
            };
        }

        acc[categoriaId].informes.push(item);
        return acc;
    }, {} as Record<number, {
        categoriaId: number;
        categoriaNombre: string;
        informes: any[];
    }>);

    return Object.values(agrupado);
}

export const postInformesiaService = async ({
    userSession,
    body
}: any) => {

    const { ServidorSQL, BaseSQL } = userSession
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL)
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);
    const query = informesiaQuery.postInformesia;

    const { Titulo, Categoria, Descripcion, PeticionUsuario, SQL: SQLQuery } = body;

    await request
        .input('Titulo', sql.VarChar(255), Titulo)
        .input('Categoria', sql.Int, Categoria)
        .input('Descripcion', sql.Text, Descripcion || null)
        .input('PeticionUsuario', sql.Text, PeticionUsuario || null)
        .input('SQL', sql.Text, SQLQuery)
        .query(query);

    await transaction.commit();

    return
}