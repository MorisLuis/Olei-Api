import { Router } from "express";
import { sendEmail, sendEmailWithPDF } from "../controllers/email";
import { validateJWTWeb } from "../middleware/validateJWTWeb";


const router = Router();
router.post('/', validateJWTWeb, sendEmail);
router.post('/cobranza/pdf/:client', validateJWTWeb, sendEmailWithPDF);
router.post('/cobranza/excell', validateJWTWeb, sendEmailWithPDF);

export default router;