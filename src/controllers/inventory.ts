import type { Response, Request, NextFunction } from "express";
import { postInventoryService } from "../services/inventoryServices";
import { postInventoryBodySchema } from "../validations/inventoryValidations";

/**
 * @description Creates an inventory movement from validated movement and product details.
 * @client App
 * @router POST /api/inventory
 * @request Validated body containing `inventoryDetails` and `typeOfMovement`.
 * @session Requires the App tenant session.
 * @response HTTP 201 JSON containing the created `Folio`; validation and transaction failures are forwarded to `next`.
 */
const postInventory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.session;
        const { inventoryDetails, typeOfMovement } = postInventoryBodySchema.parse(req.body);

        const { Folio } = await postInventoryService({
            userSession,
            inventoryDetails,
            typeOfMovement
        });

        return res.json({ Folio });

    } catch (error) {
        return next(error);
    }
};

export {
    postInventory
}
