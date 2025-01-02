import { Response, Request, NextFunction } from "express";
import { dbConnection } from "../database";
import sql from 'mssql';
import { inventoryQuerys } from "../database/querys/inventory";
import { currentTime } from "../utils/currentTime";
import { convertArrayToXml } from "../utils/convertArrayToXml";
import { handleGetSession } from "../utils/Redis/getSession";
import BadRequestError from '../errors/BadRequestError';
import { postInventoryService } from "../services/inventoryServices";
import { getInventoryQuerySchema, postInventoryBodySchema } from "../validations/inventoryValidations";

const postInventory = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const sessionId = req.sessionID;
        const Id_Usuario = req.id;
        const { inventoryDetails, typeOfMovement } = postInventoryBodySchema.parse(req.body);

        const { Folio } = await postInventoryService({
            sessionId,
            inventoryDetails,
            typeOfMovement,
            Id_Usuario
        });

        res.json({ Folio });

    } catch (error) {
        next(error)
    }
};

const getInventory = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { Folio } = getInventoryQuerySchema.parse(req.query);
        const pool = await dbConnection();

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
};

const getInventoryDetails = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const { Folio } = getInventoryQuerySchema.parse(req.query);

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
};

export {
    postInventory,
    getInventory,
    getInventoryDetails
}