import { Router } from "express";
import { searchProduct, searchClient } from "../controllers/search";


const router = Router()

router.get("/", searchProduct)

router.get("/client", searchClient)

export default router;