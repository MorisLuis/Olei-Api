import { Response, Request, NextFunction } from "express";
import { dbConnection } from "../database";
import { inventoryQuerys } from "../database/querys/inventory";
import BadRequestError from '../errors/BadRequestError';
import { getInventoryDetailsService, getInventoryService, postInventoryService, searchProductInventoryService } from "../services/inventoryServices";
import { getInventoryQuerySchema, postInventoryBodySchema, searchProductInventoryQuerySchema } from "../validations/inventoryValidations";
import { z } from "zod";

const getInventory = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { Folio } = getInventoryQuerySchema.parse(req.query);
        const sessionId = req.sessionID;

        const { inventory } = await getInventoryService({ Folio, sessionId })

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
        const sessionId = req.sessionID;
        const { inventoryDetails } = await getInventoryDetailsService({ Folio, sessionId })
        res.json(inventoryDetails)

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

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
        console.log({ error })
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