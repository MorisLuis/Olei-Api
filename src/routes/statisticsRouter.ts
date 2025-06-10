import { Router } from "express";
import { getCRMBrief } from "../controllers/statistics";
import { validateJWTWeb } from "../middleware/validateJWTWeb";


const router = Router();
router.get('/crm-brief', validateJWTWeb, getCRMBrief)

export default router;