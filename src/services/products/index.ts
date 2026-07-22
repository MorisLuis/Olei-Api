import { dbConnection } from "../../database";
import { productsQuerys } from "../../database/querys/products";
import { ValidationError } from "../../errors/CustomError";
import { guessBarcodeType } from "./utils";
import type ProductInterface from "../../interface/product";
import type { getProductByStockAndCodeBarServiceParams, getProductsByStockServiceParams, searchProductInventoryServiceParams } from "./types";


/**
 * @description Service to get products by stock with pagination and optional total count.
 * if getTotal is true, it will return the total count of products instead of the product list.
 * @param {getProductsByStockServiceParams} params - The parameters for the service.
 * @param {UserSessionInterface} params.userSession - The user session containing database connection info.
 * @param {number} [params.PageSize] - The number of products per page (optional).
 * @param {number} [params.PageNumber] - The page number to retrieve (optional).
 * @param {boolean} [params.getTotal=false] - Whether to get the total count of products (default: false).
 * @param {string | null} [params.Id_Almacen] - The ID of the warehouse (optional).
 * @returns {Promise<{ products: ProductInterface[] | number }>} - A promise that resolves to an object containing either the list of products or the total count.
 * @throws {ValidationError} - Throws an error if the database connection fails or required parameters are missing.
 */

const getProductsByStockService = async ({
    userSession,
    PageSize,
    PageNumber,
    getTotal = false,
    Id_Almacen: Id_AlmacenParam
}: getProductsByStockServiceParams): Promise<{ products: ProductInterface[] | number }> => {

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre, SalidaSinExistencias } = userSession;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    let query;
    if (getTotal) {
        query = productsQuerys.getTotalOfAllProductsByStock;
    } else {
        query = productsQuerys.getAllProductsByStock;
    };

    if (!Id_Almacen || !Id_ListPre || !SalidaSinExistencias) {
        throw new ValidationError('Faltan parámetros requeridos: Id_Almacen, Id_ListPre o SalidaSinExistencias');
    };

    const request = await pool.request()
        .input('PageSize', PageSize)
        .input('PageNumber', PageNumber)
        .input('Id_ListaPrecios', Id_ListPre)
        .input('Id_Almacen', Id_AlmacenParam ? Id_AlmacenParam : Id_Almacen)
        .input('SalidaSinExistencias', SalidaSinExistencias)
        .query(query);

    let productsByStock

    if (getTotal) {
        productsByStock = request.recordset[0].TotalProductos;
    } else {
        productsByStock = request.recordset;
    };

    return {
        products: productsByStock
    }
};

/**
 * @description Service to get a product by stock and code bar.
 * @param {getProductByStockAndCodeBarServiceParams} params - The parameters for the service.
 * @param {UserSessionInterface} params.userSession - The user session containing database connection info.
 * @param {string} params.CodBar - The code bar of the product.
 * @param {string} params.SKU - The SKU of the product.
 * @param {string} params.Codigo - The code of the product.
 * @returns {Promise<{ productByStockAndCodeBar: ProductInterface[] }>} - A promise that resolves to an object containing the list of products matching the criteria.
 * @throws {ValidationError} - Throws an error if the database connection fails or required parameters are missing.
 */

const getProductByStockAndCodeBarService = async ({
    userSession,
    CodBar,
    SKU,
    Codigo
}: getProductByStockAndCodeBarServiceParams): Promise<{ productByStockAndCodeBar: ProductInterface[] }> => {

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre, SalidaSinExistencias } = userSession;
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
            .input('SalidaSinExistencias', SalidaSinExistencias)
            .query(query);

    } else {
        let query = productsQuerys.getProductByStockAndCodeBar;
        request = await pool.request()
            .input('SKU', SKU)
            .input("Codigo", Codigo === 'undefined' ? null : Codigo)
            .input("CodBar", CodBar === 'undefined' ? null : CodBar)
            .input('Id_ListaPrecios', Id_ListPre)
            .input('Id_Almacen', Id_Almacen)
            .input('SalidaSinExistencias', SalidaSinExistencias)
            .query(query);
    };

    const productByStockAndCodeBar = request.recordset;

    return { productByStockAndCodeBar }
}

/**
 * @description Service to search products in inventory by search term.
 * @param {searchProductInventoryServiceParams} params - The parameters for the service.
 * @param {UserSessionInterface} params.userSession - The user session containing database connection info.
 * @param {string} params.searchTerm - The search term to filter products.
 * @param {boolean} params.withCodebar - Whether to include products with code bars in the search.
 * @param {string | null} [params.Id_Almacen] - The ID of the warehouse (optional).
 * @returns {Promise<{ products: ProductInterface[] }>} - A promise that resolves to an object containing the list of products matching the search criteria.
 * @throws {ValidationError} - Throws an error if the database connection fails or required parameters are missing.
 */

const searchProductByStockService = async ({
    userSession,
    searchTerm,
    withCodebar,
    Id_Almacen: Id_AlmacenParam
}: searchProductInventoryServiceParams): Promise<{ products: ProductInterface[] }> => {

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre, SalidaSinExistencias } = userSession;

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
        .input('Id_Almacen', Id_AlmacenParam ? Id_AlmacenParam : Id_Almacen)
        .input('Id_ListaPrecios', Id_ListPre)
        .input('SalidaSinExistencias', SalidaSinExistencias)
        .query(query);

    const products = result.recordset


    return {
        products
    }
};


export {
    getProductsByStockService,
    getProductByStockAndCodeBarService,
    searchProductByStockService
}