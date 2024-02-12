import { Router } from "express";
import { searchProduct, searchClient, searchProductInventory } from "../controllers/search";


const router = Router()

router.get("/", searchProduct)

router.get("/inventory", searchProductInventory)

router.get("/client", searchClient)

export default router;