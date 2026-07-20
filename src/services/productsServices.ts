import sql from 'mssql';
import { dbConnectionWeb } from "../database";
import { productsWebQuerys } from "../database/querys/productsWeb";

import { getProductWithImages, getProductsWithImage } from "../utils/checkImageExists";
import { ValidationError } from "../errors/CustomError";
import type ProductInterface from "../interface/product";
import type { UserWebSessionInterface } from '../interface/user';


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
    const productsWithImages = await getProductsWithImage(products)

    return {
        products: productsWithImages
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



export {
    getProductsService,
    getProducByIdWebService,
    getTotalProductsService
}