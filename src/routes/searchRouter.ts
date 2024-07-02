import { Router } from "express";
import { validateJWT, validateJWTWeb } from "../helpers/validate-jwt";
import { searchClient, searchProduct } from "../controllers/search/searchWeb";
import { searchProductInventory } from "../controllers/search/search";


const router = Router()

router.get("/", validateJWTWeb, searchProduct)

router.get("/inventory", validateJWT, searchProductInventory)

router.get("/client", validateJWTWeb, searchClient)

export default router;