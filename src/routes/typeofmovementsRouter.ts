import { Router } from "express";
import { changeTypeofmovements, getTypeofmovements } from "../controllers/typeofmovements";
import { validateJWT } from "../helpers/validate-jwt";


const router = Router();
router.get('/', validateJWT, getTypeofmovements);
router.put('/', validateJWT, changeTypeofmovements);


export default router;