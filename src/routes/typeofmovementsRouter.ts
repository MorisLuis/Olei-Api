import { Router } from "express";
import { getTypeofmovements } from "../controllers/typeofmovements";
import { validateJWT } from "../helpers/validate-jwt";


const router = Router();
router.get('/', validateJWT, getTypeofmovements);

export default router;