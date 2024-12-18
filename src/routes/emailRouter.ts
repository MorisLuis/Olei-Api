import { Router } from "express";
import { validateJWT } from "../helpers/validate-jwt";
import { sendEmail } from "../controllers/email";


const router = Router();
router.post('/', sendEmail);

export default router;