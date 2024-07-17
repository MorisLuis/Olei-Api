import { Request, Response } from 'express'
import { closeDbConnection, dbConnection } from '../../database';
import { productsQuerys } from '../../database/querys/products';
import sql from 'mssql';
import fetch from 'node-fetch';
import { getClientData, getUserDataWeb } from '../../Storage/storageWeb';

const getProducts = async (req: Request, res: Response) => {

    const { nombre, marca, familia, folio, enStock, page, limit } = req.query;

    const serverWeb = req.serverweb;
    const baseWeb = req.baseweb;
    const clientid = req.clientid;

    // Get the user information from shared data, including the user's warehouse (Almacen)
    const currentUser = getUserDataWeb(baseWeb.trim())
    const currentClient = getClientData(`${baseWeb.trim()}_${clientid}`)

    let userAlmacen;
    let userListPrice;
    if (currentClient) {
        userAlmacen = currentClient?.Id_Almacen;
        userListPrice = currentClient?.Id_ListPre;
    } else {
        userAlmacen = currentUser?.Id_Almacen;
        userListPrice = currentUser?.Id_ListPre;
    }

    try {
        const pool = await dbConnection(serverWeb, baseWeb);

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        // Define query parameters for the SQL query
        const params = {
            ListaPrecios: userListPrice, // Default ListaPrecios value
            Almacen: userAlmacen, // User's warehouse
        };


        let query = productsQuerys.getAllProducts;

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

        // Dont show products without stock
        if (!currentUser?.SwSinStock) {
            query += ' AND E.Existencia > 0';
        }

        // Dont show products without price
        if (!currentUser?.SwsinPrecio) {
            query += 'AND PR.Precio > 0'
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

        if (currentUser?.SwImagenes) {
            // Ahora, para cada producto, agrega la propiedad "imagen"
            for (const product of products) {
                // Supongamos que la URL de la imagen se basa en la propiedad "Codigo" del producto
                const baseSQL = baseWeb.trim().toLowerCase().split(',');

                if (baseSQL && baseSQL.length > 0) {
                    const formatImageDB = baseSQL[baseSQL.length - 1].split('_');
                    const imageDB = formatImageDB[formatImageDB.length - 1];
                    const imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product.Codigo.trim()}.jpg`;

                    // Verifica si la imagen existe antes de agregarla al producto
                    const imageExists = await checkImageExists(imageUrl);

                    if (imageExists) {
                        product.imagen = [{
                            url: imageUrl,
                            id: 1
                        }];
                    }
                }
            }
        }

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
    } finally {
        await closeDbConnection()
    }
};

const getProducByIdWeb = async (req: Request, res: Response) => {

    const { id } = req.params;
    const { Marca } = req.query;


    const serverWeb = req.serverweb;
    const baseWeb = req.baseweb;
    const clientid = req.clientid;


    // Get the user information from shared data, including the user's warehouse (Almacen)
    const currentUser = getUserDataWeb(baseWeb.trim())
    const currentClient = getClientData(`${baseWeb.trim()}_${clientid}`)

    let userAlmacen;
    let userListPrice;
    if (currentClient) {
        userAlmacen = currentClient?.Id_Almacen;
        userListPrice = currentClient?.Id_ListPre;
    } else {
        userAlmacen = currentUser?.Id_Almacen;
        userListPrice = currentUser?.Id_ListPre;
    }

    try {
        if (!currentUser && !currentClient) {
            return res.status(500).json({ error: 'No se pudo obtener el usuario actual' });
        }

        const pool = await dbConnection(serverWeb, baseWeb);

        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }

        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", userListPrice)
            .input("Almacen", userAlmacen)
            .query(productsQuerys.getProducById);

        const product = result?.recordset[0];

        //if (user?.SwImagenes) {
        const baseSQL = baseWeb.trim().toLowerCase().split(',');

        if (baseSQL && baseSQL.length > 0) {
            const formatImageDB = baseSQL[baseSQL.length - 1].split('_');
            const imageDB = formatImageDB[formatImageDB.length - 1];

            // Número máximo de intentos para encontrar la imagen
            const maxAttempts = 5;
            let attempt = 0;
            let images = [];

            while (attempt < maxAttempts) {
                let imageUrl;
                if (attempt === 0) {
                    imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product?.Codigo.trim()}.jpg`;
                } else {
                    imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product?.Codigo.trim()}_${attempt}.jpg`;
                }

                // Verifica si la imagen existe
                const imageExists = await checkImageExists(imageUrl);

                if (imageExists) {
                    images.push({
                        url: imageUrl,
                        id: attempt
                    });
                }

                attempt++;
            }

            if (images.length > 0) {
                // Se encontraron imágenes existentes
                product.imagen = images;
            }
        }

        return res.json(product);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ error });
    } finally {
        await closeDbConnection()
    }
}

const getTotalProducts = async (req: Request, res: Response) => {

    try {
        const serverWeb = req.serverweb;
        const baseWeb = req.baseweb;

        const pool = await dbConnection(serverWeb, baseWeb);
        const result = await pool?.request().query(productsQuerys.getTotalProducts);
        res.json(result?.recordset[0][""]);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ error });
    } finally {
        await closeDbConnection()
    }
};


// Utils
const checkImageExists = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Error during image check:', error);
        return false;
    }
};

interface getImageInterface {
    base?: string,
    products: any
}

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



export {
    getProducts,
    getProducByIdWeb,
    getTotalProducts
}