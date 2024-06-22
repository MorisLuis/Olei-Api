import { Request, Response } from 'express'
import { sharedData } from '..';
import { dbConnection } from '../database';
import { productsQuerys } from '../database/querys/products';
import sql from 'mssql';
import fetch from 'node-fetch';
import UserInterface from '../interface/user';

const getProducts = async (req: Request, res: Response) => {

    const { nombre, marca, familia, folio, enStock, page, limit } = req.query;

    // Get the user information from shared data, including the user's warehouse (Almacen)
    const client = sharedData?.currentClient?.client;
    const user = sharedData.currentUser?.user
    const userAlmacen = client?.Id_Almacen;
    const userListPrice = client?.Id_ListPre;

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
        if (!user?.SwSinStock) {
            query += ' AND E.Existencia > 0';
        }

        // Dont show products without price
        if (!user?.SwsinPrecio) {
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


        if (user?.SwImagenes) {
            // Ahora, para cada producto, agrega la propiedad "imagen"
            for (const product of products) {
                // Supongamos que la URL de la imagen se basa en la propiedad "Codigo" del producto
                const baseSQL = user?.BaseSQL.trim().toLowerCase().split(',');

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
    }
};

const getProducById = async (req: Request, res: Response) => {

    const { id } = req.params;
    const { Marca } = req.query;

    const client = sharedData?.currentClient?.client;
    const user = sharedData.currentUser?.user

    let userListPrice;
    let userAlmacen;

    if( client ) {
        userListPrice = client?.Id_ListPre;
        userAlmacen = client?.Id_Almacen;
    } else {
        userListPrice = user?.Id_ListPre;
        userAlmacen = user?.Id_Almacen;
    }


    try {
        const pool = await dbConnection();

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

        if (user?.SwImagenes) {
            const baseSQL = user?.BaseSQL.trim().toLowerCase().split(',');

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
                        /* https://oleistorage.blob.core.windows.net/mxnl00181/001_1.jpg */
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
        }

        return res.json(product);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ error });
    }
}

const getTotalProducts = async (req: Request, res: Response) => {
    const pool = await dbConnection();

    const result = await pool?.request().query(productsQuerys.getTotalProducts);

    res.json(result?.recordset[0][""]);
};

const getProductsByStock = async (req: Request, res: Response) => {

    const { PageNumber, PageSize } = req.query;
    const user = sharedData.currentUser?.user
    const client = sharedData?.currentClient?.client;

    let userListPrice;
    let userAlmacen;

    if( client ) {
        userListPrice = client?.Id_ListPre;
        userAlmacen = client?.Id_Almacen;
    } else {
        userListPrice = user?.Id_ListPre;
        userAlmacen = user?.Id_Almacen;
    }

    try {
        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }


        let query = productsQuerys.getAllProductsByStock;

        const request = await pool.request()
            .input('PageSize', Number(PageSize))
            .input('PageNumber', PageNumber)
            .input('Id_ListaPrecios', userListPrice)
            .input('Almacen', userAlmacen)

            .query(query);

        const productsByStock = request.recordset;

        const { products } = await getImagesFromProducts({
            user: user as UserInterface,
            products: productsByStock
        })

        res.json(products);

    } catch (error: any) {
        console.log({ error })
        res.status(500).json({ error: error.message });
    }
}

const getProductByStockAndCodeBar = async (req: Request, res: Response) => {

    const { CodBar, Codigo } = req.query;
    const user = sharedData?.currentUser?.user;
    const Id_ListaPrecios = user?.Id_ListPre;
    const Id_Almacen = user?.Id_Almacen;

    try {
        const pool = await dbConnection();

        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }


        let isEAN13orUPC14 = false;
        if ( CodBar ) {
            isEAN13orUPC14 = guessBarcodeType(CodBar)
        }

        let request
        if(isEAN13orUPC14)  {
            let query = productsQuerys.getProductByStockAndCodeBarDV;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input("Id_ListaPrecios", Id_ListaPrecios)
                .input("Id_Almacen", Id_Almacen)
                .query(query);

        } else {         
            let query = productsQuerys.getProductByStockAndCodeBar;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input("Codigo", Codigo === 'undefined' ? null : Codigo)
                .input("Id_ListaPrecios", Id_ListaPrecios)
                .input("Id_Almacen", Id_Almacen)
                .query(query);

        }
        const productByStockAndCodeBar = request.recordset;
        res.json(productByStockAndCodeBar)

    } catch (error: any) {
        return res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud / getProductByStockAndCodeBar' });
    }
}


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
    user: UserInterface,
    products: any
}

const getImagesFromProducts = async ({
    user,
    products
}: getImageInterface) => {


    if (user?.SwImagenes) {
        // Ahora, para cada producto, agrega la propiedad "imagen"
        for (const product of products) {
            // Supongamos que la URL de la imagen se basa en la propiedad "Codigo" del producto
            const baseSQL = user?.BaseSQL.trim().toLowerCase().split(',');

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

    return { products }
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

const guessBarcodeType = (code: any) => {

    if (/^[0-9]{12}$/.test(code)) {
        //UPC-A
        return true;
    } else if (/^[0-9]{12,13}$/.test(code)) {
        //EAN-13
        return true;
    }

    return false;
};


export {
    getProducts,
    getProducById,
    getTotalProducts,
    getProductsByStock,
    getProductByStockAndCodeBar
}