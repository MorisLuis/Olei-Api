import { Router } from "express";
import { askAI, exportToCSV } from "../controllers/ai/ai.controller";
import { validateJWTWeb } from "../middleware/validateJWTWeb";


const router = Router();
router.post('/', validateJWTWeb, askAI)
router.get('/export', validateJWTWeb, exportToCSV)

export default router;