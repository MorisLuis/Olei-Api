import { Request, Response } from 'express'
import { sharedData } from '../app';
import { dbConnection, querys } from '../database';
import sql from 'mssql';

async function executeQuery(pool: sql.ConnectionPool, query: string, params: any) {
    try {
        // Execute the query with provided parameters
        const result = await pool.request()
            .input('ListaPrecios', sql.Int, params.ListaPrecios)
            .input('Almacen', sql.Int, params.Almacen)
            .query(query);

        return result.recordset;
    } catch (error) {
        throw error;
    }
}

const getProducts = async (req: Request, res: Response) => {
    const { nombre, marca, familia, folio, enStock, page, limit } = req.query;

    // Get the user information from shared data, including the user's warehouse (Almacen)
    const client = sharedData?.currentClient?.client;
    const userAlmacen = client?.Id_Almacen;
    const userListPrice = client?.Id_ListPre;

    console.log({client})

    // CONDICIONAR SI ES EMPLEADO USAR UN ID_LISTAPRECIOS DEL CLIENTE.
    // PROVIENE DEL QUERY

    try {
        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        // Define query parameters for the SQL query
        const params = {
            ListaPrecios: userListPrice, // Default ListaPrecios value
            Almacen: userAlmacen, // User's warehouse
        };

        let query = querys.getAllProducts;

        if (nombre) {
            query += ` AND (LOWER(P.Descripcion) LIKE '%' + LOWER('${nombre}') + '%')`;
        }

        if (marca && marca !== 'undefined') {
            query += ` AND (LOWER(M.Nombre) LIKE '%' + LOWER('${marca}') + '%')`;
        }

        if (familia && familia !== 'undefined') {
            query += ` AND (LOWER(F.Nombre) LIKE '%' + LOWER('${familia}') + '%')`;
        }

        if (folio && folio !== 'undefined') {
            query += ` AND (LOWER(P.Codigo) LIKE '%' + LOWER('${folio}') + '%')`;
        }

        if (enStock === 'true') {
            query += ' AND E.Existencia > 0';
        }

        let paginationQuery = '';

        // Check if pagination parameters are provided
        if (page && limit) {
            const pageNumber = parseInt(page as string) || 1;
            const limitNumber = parseInt(limit as string) || 20;
            const offset = (pageNumber - 1) * limitNumber;

            paginationQuery = `
                SELECT *
                FROM (
                    ${query.replace('SELECT DISTINCT', 'SELECT ROW_NUMBER() OVER(ORDER BY P.Codigo) AS RowNum,')}
                ) AS NumberedResults
                WHERE RowNum > ${offset}
                AND RowNum <= ${offset + limitNumber}
            `;
        }

        // Use the pagination query if available; otherwise, use the base query
        const finalQuery = paginationQuery || query;

        // Execute the parameterized query
        const products = await executeQuery(pool, finalQuery, params);


        // Get the total count without pagination
        const total = products.length;

        res.json({
            total,
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 20,
            products
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


const getProducById = async (req: Request, res: Response) => {

    try {
        const pool = await dbConnection()
        const result = await pool
            ?.request()
            .input("id", req.params.id)
            .query(querys.getProducById)

        return res.json(result?.recordset[0]);
    } catch (error: any) {
        res.status(500)
        res.send(error.message);
    }

}

const getTotalProducts = async (req: Request, res: Response) => {
    const pool = await dbConnection();

    const result = await pool?.request().query(querys.getTotalProducts);

    res.json(result?.recordset[0][""]);
};


export {
    getProducts,
    getProducById,
    getTotalProducts,
}