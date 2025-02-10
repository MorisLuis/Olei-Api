import { dbConnection, querys } from "../database";
import { productsQuerys } from "../database/querys/products";
import BadRequestError from "../errors/BadRequestError";
import InventoryDetailsInterface from "../interface/inventoryDetails";
import { handleGetSession } from "../utils/Redis/getSession";
import { convertArrayToXml } from "../utils/convertArrayToXml";
import { currentTime } from "../utils/currentTime";
import sql from 'mssql';

interface postInventoryServiceInterface {
    sessionId: string;
    inventoryDetails: Partial<InventoryDetailsInterface>[];
    typeOfMovement: { Accion: string, Id_TipoMovInv: Number, Id_AlmDest: Number };
    Id_Usuario: string;
}

export const postInventoryService = async ({
    sessionId,
    inventoryDetails,
    typeOfMovement,
    Id_Usuario
}: postInventoryServiceInterface) => {

    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = userFR;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    const Accion = typeOfMovement.Accion;
    const Id_TipoMovInv = typeOfMovement.Id_TipoMovInv;
    const ExpectedRows = inventoryDetails.length;
    const ExpectedTotalQuantity = inventoryDetails.reduce((sum: any, item: any) => sum + item.Cantidad, 0);

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Get the inventory data.
    const inventoryData = {
        Estado: 1, // If it were 0 it would mean a inventory was cancelled
        Fecha: currentTime(),
        Id_TipoMovInv: typeOfMovement?.Id_TipoMovInv,
        Id_AlmacenDest: typeOfMovement?.Id_AlmDest,
        SwPendiente: 0,
        Descripcion: '',
        SwTr: 0,
        FolioReq: null,
        AlmReq: 0,
    }

    const xmlDataInventory = await convertArrayToXml(inventoryData);
    const xmlDataInventoryDetails = await convertArrayToXml(inventoryDetails);


    const result = await request
        .input('xmlDataInventory', sql.Xml, xmlDataInventory)
        .input('xmlDataInventoryDetails', sql.Xml, xmlDataInventoryDetails)
        .input('Accion', sql.Int, Accion)
        .input('Id_TipoMovInv', sql.Int, Id_TipoMovInv)
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
}

export const searchProductInventoryService = async ({
    sessionId,
    searchTerm,
} : searchProductInventoryServiceInterface ) => {

    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { ServidorSQL, BaseSQL, userId, PasswordSQL, UsuarioSQL } = userFR;

    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: "Unable to establish a connection to the database", logging: true });
    }

    const query = productsQuerys.getProductsBySearchInventory;
    const result = await pool.request()
        .input("searchTerm", searchTerm)
        .input('Id_Usuario', userId)
        .query(query);

    const products = result.recordset


    return {
        products
    }
};
