import { dbConnection } from "../database";
import { ValidationError } from "../errors/CustomError";
import type InventoryDetailsInterface from "../interface/inventoryDetails";
import type { UserSessionInterface } from "../interface/user";
import { convertArrayToXml } from "../utils/convertArrayToXml";
import { currentTime } from "../utils/currentTime";
import sql from 'mssql';

interface postInventoryServiceInterface {
    userSession: UserSessionInterface;
    inventoryDetails: Partial<InventoryDetailsInterface>[];
    typeOfMovement: { Accion: string, Id_TipoMovInv: number, Id_AlmDest: number };
}

export const postInventoryService = async ({
    userSession,
    inventoryDetails,
    typeOfMovement
}: postInventoryServiceInterface): Promise<{ Folio: number }> => {

    try {
        /* TodosAlmacenes PENDING */
        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_UsuarioOLEI } = userSession;
        const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

        if (!pool) {
            throw new ValidationError('Error al conectarse a base de datos principal');
        };

        const Accion = typeOfMovement.Accion;
        const Id_TipoMovInv = typeOfMovement.Id_TipoMovInv;
        const ExpectedRows = inventoryDetails.length;
        const ExpectedTotalQuantity: number = inventoryDetails.reduce((sum, item) => sum + (item.Cantidad ?? 0), 0);

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
            .input('user', sql.NVarChar(50), Id_UsuarioOLEI)
            .input('ExpectedRows', sql.Int, ExpectedRows)
            .input('ExpectedTotalQuantity', sql.Decimal(18, 0), ExpectedTotalQuantity)
            .output('Folio', sql.Int)
            .execute('fn_ExecuteInventory');

        const Folio = result.output.Folio;
        await transaction.commit();

        return {
            Folio
        }

    } catch (error) {
        throw new ValidationError(`${error}`);
    }

};