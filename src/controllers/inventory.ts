import { Response, Request, NextFunction } from "express";
import { postInventoryService } from "../services/inventoryServices";
import { postInventoryBodySchema } from "../validations/inventoryValidations";

const postInventory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.session;

        const { inventoryDetails, typeOfMovement } = postInventoryBodySchema.parse(req.body);

        const {Folio} = await postInventoryService({
            userSession,
            inventoryDetails,
            typeOfMovement
        });

        return res.json({ Folio });

    } catch (error) {
        console.log({error})
        return next(error);
    }
};

export {
    postInventory
}