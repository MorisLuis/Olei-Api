import { Router } from "express";
import { postInventory } from "../controllers/inventory";
import { searchProductInventory, searchProductInventoryWithoutCodebar } from "../controllers/products/products";
import { validateJWT } from "../middleware/validateJWT";


const router = Router();

router.post('/', validateJWT, postInventory);
router.get('/search/product', validateJWT, searchProductInventory);
router.get('/search/product/withoutcodebar', validateJWT, searchProductInventoryWithoutCodebar);

export default router;