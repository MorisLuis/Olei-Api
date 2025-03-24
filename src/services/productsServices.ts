import sql from 'mssql';
import { dbConnection, dbConnectionWeb } from "../database";
import { productsWebQuerys } from "../database/querys/productsWeb";
import { productsQuerys } from "../database/querys/products";

import { getProductWithImages } from "../utils/checkImageExists";
import { ValidationError } from "../errors/CustomError";
import ProductInterface from "../interface/product";
import { guessBarcodeType } from '../utils/identifyBarcodeType';
import { UserSessionInterface, UserWebSessionInterface } from '../interface/user';


// Web endpoints
interface getProductsServiceInterface {
    userSession: UserWebSessionInterface;
    page: number;
    limit: number;
    nombre: string;
    marca: string;
    familia: string;
    folio: string;
}

const getProductsService = async ({
    userSession,
    page,
    limit,
    nombre,
    marca,
    familia,
    folio
}: getProductsServiceInterface): Promise<{ products: ProductInterface[] }> => {


    const { ServidorSQL, BaseSQL, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

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
        .input('baseSQL', sql.VarChar, BaseSQL ?? '')
        .query(query);

    const products = result.recordset;

    return {
        products
    }

};

interface getProducByIdWebServiceInterface {
    userSession: UserWebSessionInterface;
    codigo: string;
    Marca: string;
};

const getProducByIdWebService = async ({
    userSession,
    codigo,
    Marca
}: getProducByIdWebServiceInterface): Promise<{ product: ProductInterface }> => {


    const { ServidorSQL, BaseSQL, Id_ListPre, Id_Almacen } = userSession;

    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const result = await pool.request()
        .input("Codigo", codigo)
        .input("Marca", Marca)
        .input("ListaPrecios", Id_ListPre)
        .input("Almacen", Id_Almacen)
        .input('baseSQL', sql.VarChar, BaseSQL || '')
        .query(productsWebQuerys.getProducById);

    const productBefore = result?.recordset[0];
    const product = await getProductWithImages({
        baseSQL: BaseSQL,
        Codigo: productBefore.Codigo,
        product: productBefore
    });

    return {
        product
    }

};

interface getTotalProductsServiceInterface {
    userSession: UserWebSessionInterface;
    nombre: string;
    marca: string;
    familia: string;
    folio: string;
}

const getTotalProductsService = async ({
    userSession,
    nombre,
    marca,
    familia,
    folio
}: getTotalProductsServiceInterface): Promise<{ total: number }> => {


    const { ServidorSQL, BaseSQL, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userSession;

    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

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
    userSession: UserWebSessionInterface;
    nombre: string;
    marca: string;
    familia: string;
    codigo: string;
}

export const searchProductService = async ({
    userSession,
    nombre,
    marca,
    familia,
    codigo
}: searchProductServiceInterface): Promise<{ products: ProductInterface[] }> => {


    const { ServidorSQL, BaseSQL, Id_ListPre, SwSinStock, SwsinPrecio, Id_Almacen } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

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
    userSession: UserSessionInterface;
    PageSize?: number;
    PageNumber?: number;

    getTotal?: boolean;
};

const getProductsByStockService = async ({
    userSession,
    PageSize,
    PageNumber,
    getTotal = false
}: getProductsByStockServiceInterface): Promise<{ products: ProductInterface[] }> => {


    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userSession;
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
    userSession: UserSessionInterface;
    CodBar: string;
    SKU: string;
    Codigo: string
}

const getProductByStockAndCodeBarService = async ({
    userSession,
    CodBar,
    SKU,
    Codigo
}: getProductByStockAndCodeBarServiceInterface) : Promise<{ productByStockAndCodeBar: ProductInterface[]}> => {

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userSession;
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
    userSession: UserSessionInterface;
    searchTerm: string;
    // handle if we get products with codebas or not
    withCodebar: boolean
}

const searchProductByStockService = async ({
    userSession,
    searchTerm,
    withCodebar
}: searchProductInventoryServiceInterface): Promise<{ products: ProductInterface[] }> => {

    const { ServidorSQL, BaseSQL, userId, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userSession;

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