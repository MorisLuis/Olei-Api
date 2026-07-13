import { Router } from "express";
import { getTypeofmovements } from "../controllers/typeofmovements";
import { validateJWTClient } from "../middleware/validateJWT";


const router = Router();
router.get('/', validateJWTClient, getTypeofmovements);

export default router;