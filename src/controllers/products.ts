import { Request, Response } from 'express'
import { dbConnection, querys } from '../database';

const getProducts = async (req: Request, res: Response) => {
    const { nombre, marca, familia, folio, enStock, page, limit } = req.query;

    try {
        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        let query = querys.getAllProducts;

        if (nombre) {
            query += ` AND (LOWER(P.Descripcion) LIKE '%' + LOWER('${nombre}') + '%')`;
        }

        if (marca) {
            query += ` AND (LOWER(M.Nombre) LIKE '%' + LOWER('${marca}') + '%')`;
        }

        if (familia) {
            query += ` AND (LOWER(F.Nombre) LIKE '%' + LOWER('${familia}') + '%')`;
        }

        if (folio) {
            query += ` AND (LOWER(P.Codigo) LIKE '%' + LOWER('${folio}') + '%')`;
        }

        if (enStock === 'true') {
            query += ' AND E.Existencia > 0';
        }

        let paginationQuery = '';
        if (page && limit) {
            const pageNumber = parseInt(page as string) || 1;
            const limitNumber = parseInt(limit as string) || 10;
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

        const finalQuery = paginationQuery || query;

        console.log({ finalQuery })

        const result = await pool.request().query(finalQuery);

        // Get the total count without pagination
        const total = result.recordset.length

        res.json({
            total,
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
            products: result.recordset,
        });

        //await pool.close();
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


const deleteProductById = async (req: Request, res: Response) => {

    try {
        const pool = await dbConnection()
        const result = await pool
            ?.request()
            .input("id", req.params.id)
            .query(querys.deleteProduct)

        if (result?.rowsAffected[0] === 0) return res.sendStatus(404);

        return res.sendStatus(204);

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
    deleteProductById,
    getTotalProducts,
}