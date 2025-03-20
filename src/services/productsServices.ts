import sql from 'mssql';
import { dbConnection, dbConnectionWeb } from "../database";
import { productsWebQuerys } from "../database/querys/productsWeb";
import { productsQuerys } from "../database/querys/products";

import { handleGetSession, handleGetWebSession } from "../utils/Redis/getSession";
import { getProductWithImages } from "../utils/checkImageExists";
import { UnauthorizedError, ValidationError } from "../errors/CustomError";
import PorductInterface from "../interface/product";
import { guessBarcodeType } from '../utils/identifyBarcodeType';


// Web endpoints
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
}: getProductsServiceInterface): Promise<{ products: PorductInterface[] }> => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;
    const pool = await dbConnectionWeb(Serverweb, Baseweb);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
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
}: getProducByIdWebServiceInterface): Promise<{ product: PorductInterface }> => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb, Id_ListPre, Id_Almacen } = userFR;

    const pool = await dbConnectionWeb(Serverweb, Baseweb);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
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
}: getTotalProductsServiceInterface): Promise<{ total: number }> => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;

    const pool = await dbConnectionWeb(Serverweb, Baseweb);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
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
}: searchProductServiceInterface): Promise<{ products: PorductInterface[] }> => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    };

    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, Id_Almacen } = userFR;
    const pool = await dbConnectionWeb(Serverweb, Baseweb);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
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


// App endpoints
interface getProductsByStockServiceInterface {
    sessionId: string;
    PageSize?: number;
    PageNumber?: number;

    getTotal?: boolean;
};

const getProductsByStockService = async ({
    sessionId,
    PageSize,
    PageNumber,
    getTotal = false
}: getProductsByStockServiceInterface): Promise<{ products: PorductInterface[] }> => {

    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userFR;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    let query;
    if (!getTotal) {
        query = productsQuerys.getAllProductsByStock;
    } else {
        query = productsQuerys.getTotalOfAllProductsByStock;
    };

    const request = await pool.request()
        .input('PageSize', PageSize)
        .input('PageNumber', PageNumber)
        .input('Id_ListaPrecios', Id_ListPre)
        .input('Almacen', Id_Almacen)
        .query(query);

    const productsByStock = request.recordset;

    return {
        products: productsByStock
    }
};

interface getProductByStockAndCodeBarServiceInterface {
    sessionId: string;
    CodBar: string;
    SKU: string;
    Codigo: string
}

const getProductByStockAndCodeBarService = async ({
    sessionId,
    CodBar,
    SKU,
    Codigo
}: getProductByStockAndCodeBarServiceInterface) => {

    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) throw new UnauthorizedError('Sesion terminada')

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userFR;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    let isEAN13orUPC14 = false;
    if (CodBar) {
        isEAN13orUPC14 = guessBarcodeType(CodBar)
    }

    let request;

    // This is an excepcion for codebar
    if (isEAN13orUPC14) {
        let query = productsQuerys.getProductByStockAndCodeBarDV;
        request = await pool.request()
            .input("CodBar", CodBar === 'undefined' ? null : CodBar)
            .input('Id_ListaPrecios', Id_ListPre)
            .input('Id_Almacen', Id_Almacen)
            .input('SKU', SKU)
            .query(query);

    } else {
        let query = productsQuerys.getProductByStockAndCodeBar;
        request = await pool.request()
            .input("CodBar", CodBar === 'undefined' ? null : CodBar)
            .input("Codigo", Codigo === 'undefined' ? null : Codigo)
            .input('Id_ListaPrecios', Id_ListPre)
            .input('Id_Almacen', Id_Almacen)
            .input('SKU', SKU)
            .query(query);
    };

    const productByStockAndCodeBar = request.recordset;

    return { productByStockAndCodeBar }
}

interface searchProductInventoryServiceInterface {
    sessionId: string;
    searchTerm: string;
    // handle if we get products with codebas or not
    withCodebar: boolean
}

const searchProductByStockService = async ({
    sessionId,
    searchTerm,
    withCodebar
}: searchProductInventoryServiceInterface): Promise<{ products: PorductInterface[] }> => {

    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { ServidorSQL, BaseSQL, userId, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userFR;

    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    let query;
    if (withCodebar) {
        query = productsQuerys.getProductsBySearchInventory;
    } else {
        query = productsQuerys.getProductsBySearchInventoryWithoutCodebar;
    };

    const result = await pool.request()
        .input("searchTerm", searchTerm)
        .input('Id_Usuario', userId)
        .input('Id_Almacen', Id_Almacen)
        .input('Id_ListPre', Id_ListPre)
        .query(query);

    const products = result.recordset


    return {
        products
    }
};


export {
    getProductsService,
    getProducByIdWebService,
    getTotalProductsService,
    getProductsByStockService,
    searchProductByStockService,
    getProductByStockAndCodeBarService
}