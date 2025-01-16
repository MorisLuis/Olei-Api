import { Router } from "express";
import { getInventory, getInventoryDetails, postInventory, searchProductInventory } from "../controllers/inventory";
import { validateJWT } from "../helpers/validate-jwt";


const router = Router();

router.get('/', getInventory);
router.get('/inventoryDetails', getInventoryDetails);
router.post('/', validateJWT, postInventory);
router.get('/search/product', validateJWT, searchProductInventory);

export default router;