import { Router } from "express";
import { sendEmail, sendEmailWithPDF } from "../controllers/email";
import { validateJWTWeb } from "../helpers/validate-jwt";


const router = Router();
router.post('/', sendEmail);
router.post('/cobranza/pdf/:client', validateJWTWeb, sendEmailWithPDF);
router.post('/cobranza/excell', validateJWTWeb, sendEmailWithPDF);

export default router;