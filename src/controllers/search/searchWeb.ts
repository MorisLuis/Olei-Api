import { Request, Response } from 'express'
import { closeDbConnection, dbConnection, querys } from '../../database';
import sql from 'mssql';
import { productsQuerys } from '../../database/querys/products';
import { getClientData, getUserDataWeb } from '../../Storage/storageWeb';

const searchProduct = async (req: Request, res: Response) => {
    const { nombre, familia, codigo, enStock, marca } = req.query;

    // Get the user's almacen (storage) ID, default to 1 if not available
    const serverWeb = req.serverweb;
    const baseWeb = req.baseweb;
    const clientid = req.clientid;

    if(!clientid) return;
    // Get the user information from shared data, including the user's warehouse (Almacen)
    const currentUser = getUserDataWeb(baseWeb.trim())
    const currentClient = getClientData(`${baseWeb.trim()}_${clientid}`)

    let userAlmacen;
    let userListPrice;
    if(currentClient){
        userAlmacen = currentClient?.Id_Almacen;
        userListPrice = currentClient?.Id_ListPre;
    } else {
        userAlmacen = currentUser?.Id_Almacen;
        userListPrice = currentUser?.Id_ListPre;
    }

    try {
        const pool = await dbConnection(serverWeb, baseWeb);

        // Define query parameters for the SQL query
        const params = {
            ListaPrecios: userListPrice,
        };


        if (!pool) {
            return res.status(500).json({ error: 'Unable to establish a connection to the database' });
        }

        // Initialize the base query with the common part
        let query = `${productsQuerys.getProductsBySearch}`;

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
                query += ` WHERE (${whereClause}) AND PR.Id_ListaPrecios = @ListaPrecios AND E.Id_Almacen = ${userAlmacen}`;
            }

            // Dont show products without stock
            if (!currentUser?.SwSinStock) {
                query += ' AND E.Existencia > 0 ';
            }

            // Dont show products without price
            if (!currentUser?.SwsinPrecio) {
                query += 'AND PR.Precio > 0'
            }
        }

        // Execute the SQL query
        const result = await pool.request()
            .input('ListaPrecios', sql.Int, params.ListaPrecios)
            .query(query);

        // Calculate the total number of results
        const total = result.recordset.length;

        // Extract the descriptions of the first 10 products for response
        const descriptions: string[] = result.recordset.slice(0, 10).map(product => product.Descripcion);

        // Send the response with total results and product descriptions
        res.json({
            total,
            products: descriptions
        });
    } catch (error: any) {
        // Handle errors and send an error response if necessary
        res.status(500).json({ error: error.message });
    } finally {
        await closeDbConnection()
    }
};

const searchClient = async (req: Request, res: Response) => {

    const { term } = req.query
    const serverWeb = req.serverweb;
    const baseWeb = req.baseweb;

    try {
        const pool = await dbConnection(serverWeb, baseWeb);

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
    } finally {
        await closeDbConnection()
    }
};


export {
    searchProduct,
    searchClient
}