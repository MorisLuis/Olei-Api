import { Router } from "express";
import { selectClient } from "../controllers/client";
import { validateJWTWeb } from "../helpers/validate-jwt";


const router = Router();
router.post('/', selectClient)

export default router;