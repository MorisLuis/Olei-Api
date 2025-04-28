import { Router } from "express";
import { validateJWTWeb } from "../middleware/validateJWT";
import { getCRMBrief } from "../controllers/statistics";


const router = Router();
router.get('/crm-brief', validateJWTWeb, getCRMBrief)

export default router;