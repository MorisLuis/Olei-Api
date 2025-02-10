import { Router } from "express";
import { getAlmacenes, updateAlmacenInRedis } from "../controllers/almacenes";
import { validateJWT } from "../helpers/validate-jwt";


const router = Router();
router.get('/', validateJWT, getAlmacenes)
router.get('/update', validateJWT, updateAlmacenInRedis)

export default router;