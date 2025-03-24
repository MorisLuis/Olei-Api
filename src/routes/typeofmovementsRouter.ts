import { Router } from "express";
import { getTypeofmovements } from "../controllers/typeofmovements";
import { validateJWT } from "../middleware/validateJWT";


const router = Router();
router.get('/', validateJWT, getTypeofmovements);

export default router;