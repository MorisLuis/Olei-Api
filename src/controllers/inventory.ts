import { Response, Request } from "express";

import { dbConnection, querys } from "../database";
import sql from 'mssql';
import { sharedData } from "..";
import moment from "moment";
import PorductInterface from "../interface/product";
import { inventoryQuerys } from "../database/querys/inventory";

const postInventory = async (req: Request, res: Response) => {

    try {
        const postInventoryData = req.body;
        const user = sharedData?.currentUser?.user;
        const Id_Almacen = user?.Id_Almacen;
        const connection = sharedData?.userConnection?.connection
        const Id_Usuario = connection?.user;

        const pool = await dbConnection();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Get last Folio
        const Folio = await pool.request().query('SELECT MAX(FOLIO) AS Folio FROM [dbo].[INVENTARIOS]');

        // Get data default.
        const Id_TipoMovInv = postInventoryData.Id_TipoMovInv;
        const Estado = 1; // If it were 0 it would mean a inventory was cancelled.
        const Id_AlmacenDest = 0;
        const SwPendiente = 0;
        const Descripcion = postInventoryData?.Descripcion;
        const SwTr = 0;
        const FolioReq = null;
        const AlmReq = 0;
        const Fecha = moment().format();
        const FechaRecepcion = Fecha;

        const postInventoryQuery = inventoryQuerys.insertInventory;

        const request = new sql.Request(transaction);

        const result = await request
            .input('Id_Almacen', sql.Int, Id_Almacen)
            .input('Folio', sql.Int, Folio.recordset[0].Folio + 1)
            .input('Id_TipoMovInv', sql.Int, Id_TipoMovInv)
            .input('Estado', sql.Int, Estado)
            .input('Fecha', sql.DateTime, Fecha)
            .input('Id_AlmacenDest', sql.Int, Id_AlmacenDest)
            .input('SwPendiente', sql.SmallInt, SwPendiente)
            .input('Descripcion', sql.VarChar(100), Descripcion)
            .input('Id_Usuario', sql.VarChar(50), Id_Usuario)
            .input('SwTr', sql.SmallInt, SwTr)
            .input('FechaRecepcion', sql.DateTime, FechaRecepcion)
            .input('FolioReq', sql.Int, FolioReq)
            .input('AlmReq', sql.Int, AlmReq)
            .query(postInventoryQuery)

        await transaction.commit();
        const inventory = result.recordset[0];

        res.json(inventory)

    } catch (error) {
        console.log({ error })
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

const postInventoryDetails = async (req: Request, res: Response) => {

    //Receive products and with that create inventory Details.

    try {
        const postInventoryDataArray: PorductInterface[] = req.body;
        const user = sharedData?.currentUser?.user;
        const Id_Almacen = user?.Id_Almacen;

        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        let countPartida = 0; // Increase the data of 'Partida'
        const inventoryDetails = [];  // Store every inventoryDetails from the for.

        for (const postInventoryData of postInventoryDataArray) {
            const request = new sql.Request(transaction);
            countPartida++;

            // Get last Folio
            const Folio = await pool.request().query('SELECT MAX(FOLIO) AS Folio FROM [dbo].[DETALLEINVENTARIOS]');


            //UPDATE 'EXISTENCIAS' Table
            const existenceUpdated = await request
                .input('Cantidad_Existence', postInventoryData.Piezas)
                .input('Codigo_Existence', postInventoryData.Codigo)
                .input('Id_Marca_Existence', postInventoryData.Id_Marca)
                .input('Id_Almacen_Existence', Id_Almacen)
                .query(querys.updateExistenceTable);

            const { Existencia, ExistenciaAnt } = existenceUpdated.recordset[0];

            // Get data default.
            const Id_Ubicacion = 0;
            const SwNS = null;
            const NumsDeSerie = null;
            const SKU = null;
            const Diferencia = Existencia - ExistenciaAnt;

            const postIntentoryDetailsQuery = inventoryQuerys.insertInventoryDetails;

            const result = await request
                .input('Id_Almacen', sql.Int, Id_Almacen)
                .input('Folio', sql.Int, Folio.recordset[0].Folio + 1)
                .input('Partida', sql.Int, countPartida)
                .input('Codigo', sql.VarChar, postInventoryData.Codigo)
                .input('Id_Marca', sql.Int, postInventoryData.Id_Marca)
                .input('Cantidad', sql.Int, postInventoryData.Piezas)
                .input('Id_Ubicacion', sql.Int, Id_Ubicacion)
                .input('Diferencia', sql.Int, Diferencia)
                .input('SwNS', sql.Int, SwNS)
                .input('NumsDeSerie', sql.VarChar, NumsDeSerie)
                .input('SKU', sql.Int, SKU)
                .query(postIntentoryDetailsQuery);

            inventoryDetails.push(result.recordset[0]);
        }

        await transaction.commit();

        res.json(inventoryDetails)

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
    postInventoryDetails,
    getInventory,
    getInventoryDetails
}