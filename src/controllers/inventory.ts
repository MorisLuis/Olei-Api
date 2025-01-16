import { Response, Request, NextFunction } from "express";
import { dbConnection } from "../database";
import { inventoryQuerys } from "../database/querys/inventory";
import BadRequestError from '../errors/BadRequestError';
import { postInventoryService, searchProductInventoryService } from "../services/inventoryServices";
import { getInventoryQuerySchema, postInventoryBodySchema, searchProductInventoryQuerySchema } from "../validations/inventoryValidations";
import { z } from "zod";

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
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
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
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
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
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

const searchProductInventory = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { searchTerm } = searchProductInventoryQuerySchema.parse(req.query);

        const sessionId = req.sessionID;
        const { products } = await searchProductInventoryService({ 
            sessionId, 
            searchTerm: searchTerm, 
        })

        res.json(products);

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

export {
    postInventory,
    getInventory,
    getInventoryDetails,
    searchProductInventory
}