import { Router } from "express";
import { updateCostos } from "../controllers/costos";


const router = Router();
router.put('/', updateCostos)

export default router;