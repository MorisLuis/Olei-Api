import { Router } from "express";
import { changeTypeofmovements, getTypeofmovements } from "../controllers/typeofmovements";


const router = Router();
router.get('/', getTypeofmovements);
router.put('/', changeTypeofmovements);


export default router;