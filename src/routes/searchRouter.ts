import { Router } from "express";
import { validateJWTWeb } from "../helpers/validate-jwt";
import { getCodigos, getFamilias, getMarcas } from "../controllers/search/search";


const router = Router()

// Web endpoints
router.get("/familias", validateJWTWeb, getFamilias);
router.get("/marcas", validateJWTWeb, getMarcas);
router.get("/codigos", validateJWTWeb, getCodigos);


export default router;