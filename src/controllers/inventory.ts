import { Response, Request, NextFunction } from "express";
import { postInventoryService, searchProductInventoryService } from "../services/inventoryServices";
import { postInventoryBodySchema, searchProductInventoryQuerySchema } from "../validations/inventoryValidations";
import { z } from "zod";

const postInventory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {

        const sessionId = req.sessionID;
        const Id_Usuario = req.Id_mobile;

        const { inventoryDetails, typeOfMovement } = postInventoryBodySchema.parse(req.body);

        const { Folio } = await postInventoryService({
            sessionId,
            inventoryDetails,
            typeOfMovement,
            Id_Usuario
        });

        return res.json({ Folio });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    }
};

const searchProductInventory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm } = searchProductInventoryQuerySchema.parse(req.query);

        const sessionId = req.sessionID;
        const { products } = await searchProductInventoryService({
            sessionId,
            searchTerm: searchTerm,
            withCodebar: true
        })

        return res.json(products);

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

const searchProductInventoryWithoutCodebar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm } = searchProductInventoryQuerySchema.parse(req.query);

        const sessionId = req.sessionID;
        const { products } = await searchProductInventoryService({
            sessionId,
            searchTerm: searchTerm,
            withCodebar: false
        })

        return res.json(products);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    }
};

export {
    postInventory,
    searchProductInventory,
    searchProductInventoryWithoutCodebar
}