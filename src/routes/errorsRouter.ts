import { Router } from "express";
import { handleErrors } from "../controllers/errors";


const router = Router();
router.post('/', handleErrors)

export default router;