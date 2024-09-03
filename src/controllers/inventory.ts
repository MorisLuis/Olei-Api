import { Response, Request } from "express";
import { dbConnection, querys } from "../database";
import sql from 'mssql';
import { inventoryQuerys } from "../database/querys/inventory";
import { currentTime } from "../utils/currentTime";
import { convertArrayToXml } from "../utils/convertArrayToXml";
import { handleGetSession } from "../utils/Redis/getSession";

const postInventory = async (req: Request, res: Response) => {

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { serverclientes, baseclientes } = userFR;

    const Id_Usuario = req.id;

    try {
        const pool = await dbConnection(serverclientes, baseclientes);
        const { inventoryDetails, typeOfMovement } = req.body;
        const Accion = typeOfMovement?.Accion;
        const Id_TipoMovInv = typeOfMovement?.Id_TipoMovInv;
        const ExpectedRows = inventoryDetails.length;
        const ExpectedTotalQuantity = inventoryDetails.reduce((sum: any, item: any) => sum + item.Cantidad, 0);;

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
        console.log({ postInventoryError: error })
        res.status(500).json({ error: error });
    }
}

const getInventory = async (req: Request, res: Response) => {

    const { Folio } = req.query;

    try {
        const pool = await dbConnection()
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const getInventoryQuery = inventoryQuerys.getInventory;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery)

        let inventory = request.recordset[0];

        res.json(inventory)

    } catch (error) {
        console.log({ error })
        res.status(500).json({ error: error });
    }
}

const getInventoryDetails = async (req: Request, res: Response) => {

    const { Folio } = req.query;

    try {
        const pool = await dbConnection()
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const getInventoryQuery = inventoryQuerys.getInventoryDetails;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery)


        let inventoryDetails = request.recordset;

        res.json(inventoryDetails)


    } catch (error) {
        console.log({ error })
        res.status(500).json({ error: error });
    }
}


export {
    postInventory,
    getInventory,
    getInventoryDetails
}