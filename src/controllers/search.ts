import { Request, Response } from 'express'
import { sharedData } from '../app';
import config from '../config';
import { dbConnection, querys } from '../database';


const searchProduct = async (req: Request, res: Response) => {
    const { nombre, familia, codigo, enStock, marca } = req.query;

    // Get the user's almacen (storage) ID, default to 1 if not available
    const userAlmacen = sharedData?.currentUser?.user?.Id_Almacen || 1;
    console.log({user : sharedData?.currentUser?.user})

    try {
        const pool = await dbConnection();

        if (!pool) {
            return res.status(500).json({ error: 'Unable to establish a connection to the database' });
        }

        // Initialize the base query with the common part
        let query = `${querys.getProductsBySearch}`;

        // Split the search term into individual words
        const searchTerms = typeof nombre === 'string' ? nombre.split(' ') : [];

        // Check if there are search terms
        if (searchTerms.length > 0) {
            // Create an array of LIKE conditions for each search term
            const likeConditions = searchTerms.map(word => `LOWER(P.Descripcion) LIKE '%' + LOWER('${word}') + '%'`);
            const whereClause = likeConditions.join(' AND ');

            // Build the dynamic SQL query based on query parameters
            if (codigo || familia || marca || (enStock === 'true' && codigo === undefined)) {
                if (familia) {
                    query += ` JOIN [OLEIDB1].[dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia`;
                }

                if (marca) {
                    query += ` JOIN [OLEIDB1].[dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca`;
                }

                query += ` WHERE (${whereClause}) AND PR.Id_ListaPrecios = 1 AND E.Id_Almacen = ${userAlmacen}`;

                if (codigo) {
                    query += ` AND (LOWER(P.Codigo) LIKE '%' + LOWER('${codigo}') + '%')`;
                }

                if (familia) {
                    query += ` AND (LOWER(F.Nombre) LIKE '%' + LOWER('${familia}') + '%')`;
                }

                if (marca) {
                    query += ` AND (LOWER(M.Nombre) LIKE '%' + LOWER('${marca}') + '%')`;
                }

                if (enStock === 'true') {
                    query += ' AND E.Existencia > 0';
                }
            } else {
                // If no specific parameters are provided, apply the WHERE clause with search terms and default filters
                query += ` WHERE (${whereClause}) AND PR.Id_ListaPrecios = 1 AND E.Id_Almacen = ${userAlmacen}`;
            }
        }

        // Execute the SQL query
        const result = await pool.request().query(query);

        // Calculate the total number of results
        const total = result.recordset.length;

        // Extract the descriptions of the first 10 products for response
        const descriptions = result.recordset.slice(0, 10).map(product => product.Descripcion);

        // Send the response with total results and product descriptions
        res.json({
            total,
            products: descriptions
        });
    } catch (error: any) {
        // Handle errors and send an error response if necessary
        res.status(500).json({ error: error.message });
    }
};


const searchClient = async (req: Request, res: Response) => {

    const { term } = req.query

    try {
        const pool = await dbConnection();

        if (!pool) {
            return res.status(500).json({ error: 'Unable to establish a connection to the database' });
        }

        let query = querys.getClientBySearch;
        query += `WHERE LOWER(C.Nombre) LIKE '%' + LOWER('${term}') + '%'`

        // Execute the SQL query
        const result = await pool.request().query(query);
        const Clients = result.recordset


        res.json({
            Clients
        })

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export {
    searchProduct,
    searchClient
}