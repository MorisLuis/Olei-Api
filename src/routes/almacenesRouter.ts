import { Router } from "express";
import { getAlmacenes, updateAlmacenInRedis } from "../controllers/almacenes";
import { validateJWTClient } from "../middleware/validateJWT";


const router = Router();
router.get('/', validateJWTClient, getAlmacenes)
router.get('/update', validateJWTClient, updateAlmacenInRedis)

export default router;