import { dbConnection } from "../database";
import { productsQuerys } from "../database/querys/products";
import { UnauthorizedError, ValidationError } from "../errors/CustomError";
import InventoryDetailsInterface from "../interface/inventoryDetails";
import PorductInterface from "../interface/product";
import { handleGetSession } from "../utils/Redis/getSession";
import { convertArrayToXml } from "../utils/convertArrayToXml";
import { currentTime } from "../utils/currentTime";
import sql from 'mssql';

interface postInventoryServiceInterface {
    sessionId: string;
    inventoryDetails: Partial<InventoryDetailsInterface>[];
    typeOfMovement: { Accion: string, Id_TipoMovInv: number, Id_AlmDest: number };
    Id_Usuario: string;
}

export const postInventoryService = async ({
    sessionId,
    inventoryDetails,
    typeOfMovement,
    Id_Usuario
}: postInventoryServiceInterface): Promise<{ Folio: string }> => {

    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    /* TodosAlmacenes PENDING */
    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen } = userFR;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const Accion = typeOfMovement.Accion;
    const Id_TipoMovInv = typeOfMovement.Id_TipoMovInv;
    const ExpectedRows = inventoryDetails.length;
    const ExpectedTotalQuantity = inventoryDetails.reduce((sum: any, item: any) => sum + item.Cantidad, 0);

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Si Accion es igual a 3, es traspaso. Si no es entrada o salida.
    const AlmacenDestino = typeOfMovement.Accion === '3' ? typeOfMovement?.Id_AlmDest : Id_Almacen

    // Get the inventory data.
    const inventoryData = {
        Estado: 1, // If it were 0 it would mean a inventory was cancelled
        Fecha: currentTime(),
        Id_TipoMovInv: typeOfMovement?.Id_TipoMovInv,
        Id_AlmacenDest: AlmacenDestino,
        SwPendiente: 0,
        Descripcion: '',
        SwTr: 0,
        FolioReq: null,
        AlmReq: 0,
    };

    const xmlDataInventory = await convertArrayToXml(inventoryData);
    const xmlDataInventoryDetails = await convertArrayToXml(inventoryDetails);

    const result = await request
        .input('xmlDataInventory', sql.Xml, xmlDataInventory)
        .input('xmlDataInventoryDetails', sql.Xml, xmlDataInventoryDetails)
        .input('Accion', sql.Int, Accion)
        .input('Id_TipoMovInv', sql.Int, Id_TipoMovInv)
        .input('Id_Almacen', sql.Int, Id_Almacen)
        .input('user', sql.NVarChar(50), Id_Usuario)
        .input('ExpectedRows', sql.Int, ExpectedRows)
        .input('ExpectedTotalQuantity', sql.Decimal(18, 0), ExpectedTotalQuantity)
        .output('Folio', sql.Int)
        .execute('fn_ExecuteInventory');

    const Folio = result.output.Folio;

    await transaction.commit();

    return {
        Folio
    }

};

interface searchProductInventoryServiceInterface {
    sessionId: string;
    searchTerm: string;
    // handle if we get products with codebas or not
    withCodebar: boolean
}

export const searchProductInventoryService = async ({
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
