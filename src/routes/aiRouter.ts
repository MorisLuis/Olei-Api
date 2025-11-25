import { Router } from "express";
import { askAI } from "../controllers/ai/ai.controller";
import { validateJWTWeb } from "../middleware/validateJWTWeb";


const router = Router();
router.post('/', validateJWTWeb, askAI)

export default router;