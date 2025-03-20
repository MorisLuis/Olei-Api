import { Router } from "express";
import { sendEmail, sendEmailWithPDF } from "../controllers/email";


const router = Router();
router.post('/', sendEmail);
router.post('/cobranza/pdf/:client', sendEmailWithPDF);
router.post('/cobranza/excell', sendEmailWithPDF);

export default router;