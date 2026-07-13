import { Router } from "express";
import { postInventory } from "../controllers/inventory";
import { searchProductInventory, searchProductInventoryWithoutCodebar } from "../controllers/products/products";
import { validateJWTClient } from "../middleware/validateJWT";


const router = Router();

router.post('/', validateJWTClient, postInventory);
router.get('/search/product', validateJWTClient, searchProductInventory);
router.get('/search/product/withoutcodebar', validateJWTClient, searchProductInventoryWithoutCodebar);

export default router;