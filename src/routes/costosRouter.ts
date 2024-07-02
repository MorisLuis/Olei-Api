import { Router } from "express";
import { updateCostos } from "../controllers/costos";
import { validateJWT } from "../helpers/validate-jwt";


const router = Router();
router.put('/', validateJWT, updateCostos)

export default router;