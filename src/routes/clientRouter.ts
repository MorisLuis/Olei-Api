import { Router } from "express";
import { selectClient } from "../controllers/client";
import { validateJWTWeb } from "../helpers/validate-jwt";


const router = Router();
router.post('/', validateJWTWeb, selectClient)

export default router;