import { dbConnection, querys } from "../database";
import { productsWebQuerys } from "../database/querys/productsWeb";
import BadRequestError from "../errors/BadRequestError";
import { handleGetSession, handleGetWebSession } from "../utils/Redis/getSession";
import sql from 'mssql';
import { getProductWithImages } from "../utils/checkImageExists";
import { productsQuerys } from "../database/querys/products";

interface getProductsServiceInterface {
    sessionId: string;
    page: number;
    limit: number;
    nombre: string;
    marca: string;
    familia: string;
    folio: string;
}

const getProductsService = async ({
    sessionId,
    page,
    limit,
    nombre,
    marca,
    familia,
    folio
}: getProductsServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    }

    let query = productsWebQuerys.getAllProducts;

    const result = await pool.request()
        .input('nombre', sql.VarChar, nombre)
        .input('marca', sql.VarChar, marca)
        .input('familia', sql.VarChar, familia)
        .input('codigo', sql.VarChar, folio)
        .input('SwSinStock', sql.Bit, SwSinStock === true ? 1 : 0)
        .input('SwsinPrecio', sql.Bit, SwsinPrecio === true ? 1 : 0)
        .input('SwImagenes', sql.Bit, SwImagenes === true ? 1 : 0)
        .input('Id_ListPre', sql.Int, Id_ListPre)
        .input('Id_Almacen', sql.Int, Id_Almacen)
        .input('page', sql.Int, page)
        .input('limit', sql.Int, limit)
        .input('baseSQL', sql.VarChar, Baseweb ?? '')
        .query(query);

    const products = result.recordset;

    return {
        products
    }

};

interface getProducByIdWebServiceInterface {
    sessionId: string;
    codigo: string;
    Marca: string;
};

const getProducByIdWebService = async ({
    sessionId,
    codigo,
    Marca
}: getProducByIdWebServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb, Id_ListPre, Id_Almacen } = userFR;

    const pool = await dbConnection(Serverweb, Baseweb);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    }

    const result = await pool.request()
        .input("Codigo", codigo)
        .input("Marca", Marca)
        .input("ListaPrecios", Id_ListPre)
        .input("Almacen", Id_Almacen)
        .input('baseSQL', sql.VarChar, Baseweb || '')
        .query(productsWebQuerys.getProducById);

    const productBefore = result?.recordset[0];
    const product = await getProductWithImages({
        baseSQL: Baseweb,
        Codigo: productBefore.Codigo,
        product: productBefore
    });

    return {
        product
    }

};

interface getTotalProductsServiceInterface {
    sessionId: string;
    nombre: string;
    marca: string;
    familia: string;
    folio: string;
}

const getTotalProductsService = async ({
    sessionId,
    nombre,
    marca,
    familia,
    folio
}: getTotalProductsServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;

    const pool = await dbConnection(Serverweb, Baseweb);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    }

    const result = await pool.request()
        .input('nombre', sql.VarChar, nombre)
        .input('marca', sql.VarChar, marca)
        .input('familia', sql.VarChar, familia)
        .input('codigo', sql.VarChar, folio)
        .input('SwSinStock', sql.Bit, SwSinStock === true ? 1 : 0)
        .input('SwsinPrecio', sql.Bit, SwsinPrecio === true ? 1 : 0)
        .input('SwImagenes', sql.Bit, SwImagenes === true ? 1 : 0)
        .input('Id_ListPre', sql.Int, Id_ListPre)
        .input('Id_Almacen', sql.Int, Id_Almacen)
        .query(productsWebQuerys.getTotalProducts);

    const total = result?.recordset[0].TotalCount;

    return {
        total
    }

};

interface searchProductServiceInterface {
    sessionId: string;
    nombre: string;
    marca: string;
    familia: string;
    codigo: string;
}

export const searchProductService = async ({
    sessionId,
    nombre,
    marca,
    familia,
    codigo
}: searchProductServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    };

    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, Id_Almacen } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: "Unable to establish a connection to the database", logging: true })
    }

    // Execute the SQL query
    const result = await pool.request()
        .input('Descripcion', sql.VarChar, nombre)
        .input('Id_ListaPrecios', sql.Int, Id_ListPre)
        .input('Id_Almacen', sql.Int, Id_Almacen)
        .input('Codigo', sql.VarChar, codigo || "")
        .input('familia', sql.VarChar, familia || "")
        .input('marca', sql.VarChar, marca || "")
        .input('SwSinStock', sql.Bit, SwSinStock === true ? 1 : 0)
        .input('SwsinPrecio', sql.Bit, SwsinPrecio === true ? 1 : 0)
        .query(productsWebQuerys.getProductsBySearch);

    const products = result.recordset.map(row => row.Descripcion);

    return {
        products
    }

};

interface getProductsByStockServiceInterface {
    sessionId: string;
    PageSize: number;
    PageNumber: number;
}
const getProductsByStockService = async ({
    sessionId,
    PageSize,
    PageNumber
}: getProductsByStockServiceInterface) => {


    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { serverclientes, baseclientes, userId, PasswordSQL, UsuarioSQL } = userFR;
    const pool = await dbConnection(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);

    const userquery = querys.getAuthLimitData;
    const requestUser = await pool.request().input('Id_Usuario', userId).query(userquery)
    const user = requestUser.recordset[0]

    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    }

    let query = productsQuerys.getAllProductsByStock;
    const request = await pool.request()
        .input('PageSize', PageSize)
        .input('PageNumber', PageNumber)
        .input('Id_ListaPrecios', user.Id_ListPre)
        .input('Almacen', user.Id_Almacen)
        .query(query);

    const productsByStock = request.recordset;

    return {
        products: productsByStock
    }
}


// Utils
/* interface getImageInterface {
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
}; */

export {
    getProductsService,
    getProducByIdWebService,
    getTotalProductsService,
    getProductsByStockService
}