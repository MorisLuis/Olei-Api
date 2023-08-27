import { Request, Response } from 'express'
import { dbConnection, querys } from '../database';


const searchProduct = async (req: Request, res: Response) => {
    const { term } = req.query;
    try {
        const pool = await dbConnection();
        let query;

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        if (term) {
            query = `${querys.getProductsBySearch} WHERE LOWER(P.Descripcion) LIKE '%' + LOWER('${term}') + '%'`;
        } else {
            query = querys.getProductsBySearch;
        }

        const result = await pool.request().query(query);
        const total = result.recordset.length;

        const descriptions = result.recordset.map(product => product.Descripcion);

        res.json({
            total,
            products: descriptions
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }

};


export {
    searchProduct
}