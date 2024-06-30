import { Router } from "express";
import { getInventory, getInventoryDetails, postInventory, postInventoryDetails } from "../controllers/inventory";
import { validateJWT } from "../helpers/validate-jwt";


const router = Router();

router.get('/', getInventory);
router.get('/inventoryDetails', getInventoryDetails);

router.post('/', validateJWT, postInventory);
router.post('/inventoryDetails', validateJWT, postInventoryDetails);


export default router;