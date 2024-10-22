import { NextFunction, Request, Response } from 'express'
import { dbConnection, querys } from '../../database';
import { productsQuerys } from '../../database/querys/products';
import { guessBarcodeType } from '../../utils/identifyBarcodeType';
import { handleGetSession } from '../../utils/Redis/getSession';
import { productsWebQuerys } from '../../database/querys/productsWeb';
import BadRequestError from '../../errors/BadRequestError';


const getProducById = async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;
    const { Marca } = req.query;
    const Id_Usuario = req.id;

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });


    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;

    try {
        const pool = await dbConnection(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);

        const userquery = querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", user.Id_ListPre)
            .input("Almacen", user.Id_Almacen)
            .input("baseSQL", baseclientes)
            .query(productsWebQuerys.getProducById);

        const product = result?.recordset[0];

        return res.json(product);
    } catch (error) {
        next(error)
    }
}

const getProductsByStock = async (req: Request, res: Response, next: NextFunction) => {

    const { PageNumber, PageSize } = req.query;
    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { serverclientes, baseclientes, userId, PasswordSQL, UsuarioSQL } = userFR;

    try {
        const pool = await dbConnection(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);

        const userquery = querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', userId).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
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

    } catch (error) {
        next(error)
    }
};

const getTotalOfProductsByStock = async (req: Request, res: Response, next: NextFunction) => {

    const Id_Usuario = req.id;

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;

    try {
        const pool = await dbConnection(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);

        const userquery = querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        let query = productsQuerys.getTotalOfAllProductsByStock;

        const request = await pool.request()
            .input('Id_ListaPrecios', user.Id_ListPre)
            .input('Almacen', user.Id_Almacen)
            .query(query);

        const TotalProductos = request.recordset;

        res.json(TotalProductos);

    } catch (error) {
        next(error)
    }
};

const getProductByStockAndCodeBar = async (req: Request, res: Response, next: NextFunction) => {

    const { CodBar, Codigo } = req.query;
    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { serverclientes, baseclientes, userId, PasswordSQL, UsuarioSQL } = userFR;

    try {
        const pool = await dbConnection(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);

        const userquery = querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', userId).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
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

    } catch (error) {
        next(error)
    }
};


// Utils
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

export const checkImageExists = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Error during image check:', error);
        return false;
    }
};


export {
    getProducById,
    getProductsByStock,
    getTotalOfProductsByStock,
    getProductByStockAndCodeBar
}