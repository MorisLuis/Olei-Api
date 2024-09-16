import { Router } from "express";
import { validateJWT, validateJWTWeb } from "../helpers/validate-jwt";
import { searchClient, searchProduct } from "../controllers/search/searchWeb";
import { searchProductInventory } from "../controllers/search/search";


const router = Router()

// App endpoints
router.get("/inventory", validateJWT, searchProductInventory)

// Web endpoints
router.get("/", validateJWTWeb, searchProduct)
router.get("/client", searchClient)

export default router;