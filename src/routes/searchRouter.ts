import { Router } from "express";
import { getCodigos, getFamilias, getMarcas } from "../controllers/search/search";
import { validateJWTWeb } from "../middleware/validateJWTWeb";


const router = Router()

// Web endpoints
router.get("/familias", validateJWTWeb, getFamilias);
router.get("/marcas", validateJWTWeb, getMarcas);
router.get("/codigos", validateJWTWeb, getCodigos);


export default router;