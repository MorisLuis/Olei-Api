import { Response, Request, NextFunction } from "express";
import { dbConnection } from "../database";
import sql from 'mssql';
import { inventoryQuerys } from "../database/querys/inventory";
import { currentTime } from "../utils/currentTime";
import { convertArrayToXml } from "../utils/convertArrayToXml";
import { handleGetSession } from "../utils/Redis/getSession";
import BadRequestError from '../errors/BadRequestError';

const postInventory = async (req: Request, res: Response, next: NextFunction) => {

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL} = userFR;
    const Id_Usuario = req.id;

    try {
        const pool = await dbConnection(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);
        const { inventoryDetails, typeOfMovement } = req.body;
        const Accion = typeOfMovement?.Accion;
        const Id_TipoMovInv = typeOfMovement?.Id_TipoMovInv;
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
            Id_AlmacenDest: 0,
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
        const inventory = result.recordset[0];

        res.json({ Folio, inventory })

    } catch (error) {
        next(error)
    }
}

const getInventory = async (req: Request, res: Response, next: NextFunction) => {

    const { Folio } = req.query;

    try {
        const pool = await dbConnection()
        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        const getInventoryQuery = inventoryQuerys.getInventory;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery)

        let inventory = request.recordset[0];

        res.json(inventory)

    } catch (error) {
        next(error)
    }
}

const getInventoryDetails = async (req: Request, res: Response, next: NextFunction) => {

    const { Folio } = req.query;

    try {
        const pool = await dbConnection()
        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        const getInventoryQuery = inventoryQuerys.getInventoryDetails;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery)

        const inventoryDetails = request.recordset;
        res.json(inventoryDetails)

    } catch (error) {
        next(error)
    }
}


export {
    postInventory,
    getInventory,
    getInventoryDetails
}