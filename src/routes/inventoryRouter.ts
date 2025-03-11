import { Router } from "express";
import { postInventory, searchProductInventory, searchProductInventoryWithoutCodebar } from "../controllers/inventory";
import { validateJWT } from "../helpers/validate-jwt";


const router = Router();

/* router.get('/', getInventory);
router.get('/inventoryDetails', getInventoryDetails); */
router.post('/', validateJWT, postInventory);
router.get('/search/product', validateJWT, searchProductInventory);
router.get('/search/product/withoutcodebar', validateJWT, searchProductInventoryWithoutCodebar);

export default router;