import { Request, Response } from 'express'
import { dbConnection, querys } from '../../database';
import { productsQuerys } from '../../database/querys/products';
import fetch from 'node-fetch';
import { guessBarcodeType } from '../../utils/identifyBarcodeType';
import { redisClient } from '../../models/server';
import { handleGetSession } from '../../utils/Redis/getSession';


const getProducById = async (req: Request, res: Response) => {

    const { id } = req.params;
    const { Marca } = req.query;
    const Id_Usuario = req.id;

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });


    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { serverclientes, baseclientes } = userFR;

    try {
        const pool = await dbConnection(serverclientes, baseclientes);

        const userquery = querys.getAuthLimitData;
        const requestUser: any = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }

        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", user.Id_ListPre)
            .input("Almacen", user.Id_Almacen)
            .query(productsQuerys.getProducById);

        const product = result?.recordset[0];

        //if (user?.SwImagenes) {
        const baseSQL = baseclientes.trim().toLowerCase().split(',');

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
    }
}

const getTotalProducts = async (req: Request, res: Response) => {
    const pool = await dbConnection();
    const result = await pool?.request().query(productsQuerys.getTotalProducts);
    res.json(result?.recordset[0][""]);
};

const getProductsByStock = async (req: Request, res: Response) => {

    const { PageNumber, PageSize } = req.query;

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });


    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { serverclientes, baseclientes, userId } = userFR;

    ///const Id_Usuario = req.id;

    try {
        const pool = await dbConnection(serverclientes, baseclientes);

        const userquery = querys.getAuthLimitData;
        const requestUser: any = await pool.request().input('Id_Usuario', userId).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }

        let query = productsQuerys.getAllProductsByStock;

        const request = await pool.request()
            .input('PageSize', Number(PageSize))
            .input('PageNumber', PageNumber)
            .input('Id_ListaPrecios', user.Id_ListPre)
            .input('Almacen', user.Id_Almacen)

            .query(query);

        const productsByStock = request.recordset;

        const { products } = await getImagesFromProducts({
            base: baseclientes,
            products: productsByStock
        })

        res.json(products);

    } catch (error: any) {
        console.log({ error })
        res.status(500).json({ error: error.message });
    }
}

const getTotalOfProductsByStock = async (req: Request, res: Response) => {

    const Id_Usuario = req.id;

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { serverclientes, baseclientes } = userFR;

    try {
        const pool = await dbConnection(serverclientes, baseclientes);

        const userquery = querys.getAuthLimitData;
        const requestUser: any = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }

        let query = productsQuerys.getTotalOfAllProductsByStock;

        const request = await pool.request()
            .input('Id_ListaPrecios', user.Id_ListPre)
            .input('Almacen', user.Id_Almacen)
            .query(query);

        const TotalProductos = request.recordset;

        res.json(TotalProductos);

    } catch (error: any) {
        console.log({ error })
        res.status(500).json({ error: error.message });
    }
}

const getProductByStockAndCodeBar = async (req: Request, res: Response) => {

    const { CodBar, Codigo } = req.query;
    //const Id_Usuario = req.id;

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { serverclientes, baseclientes, userId } = userFR;


    try {
        const pool = await dbConnection(serverclientes, baseclientes);

        const userquery = querys.getAuthLimitData;
        const requestUser: any = await pool.request().input('Id_Usuario', userId).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }


        let isEAN13orUPC14 = false;
        if (CodBar) {
            isEAN13orUPC14 = guessBarcodeType(CodBar)
        }

        let request;

        if (isEAN13orUPC14) {
            let query = productsQuerys.getProductByStockAndCodeBarDV;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input('Id_ListaPrecios', user.Id_ListPre)
                .input('Id_Almacen', user.Id_Almacen)
                .query(query);

        } else {
            let query = productsQuerys.getProductByStockAndCodeBar;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input("Codigo", Codigo === 'undefined' ? null : Codigo)
                .input('Id_ListaPrecios', user.Id_ListPre)
                .input('Id_Almacen', user.Id_Almacen)
                .query(query);

        }
        const productByStockAndCodeBar = request.recordset;
        res.json(productByStockAndCodeBar)

    } catch (error: any) {
        console.log({ error })
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
    base?: string,
    products: any
}

const getImagesFromProducts = async ({
    base,
    products
}: getImageInterface) => {

    // Ahora, para cada producto, agrega la propiedad "imagen"
    for (const product of products) {
        // Supongamos que la URL de la imagen se basa en la propiedad "Codigo" del producto
        const baseSQL = base?.trim().toLowerCase().split(',');

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

    return { products }
}



export {
    getProducById,
    getTotalProducts,
    getProductsByStock,
    getTotalOfProductsByStock,
    getProductByStockAndCodeBar
}