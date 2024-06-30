import { Router } from "express";
import { searchProduct, searchClient, searchProductInventory } from "../controllers/search";
import { validateJWT } from "../helpers/validate-jwt";


const router = Router()

router.get("/", searchProduct)

router.get("/inventory", validateJWT, searchProductInventory)

router.get("/client", searchClient)

export default router;