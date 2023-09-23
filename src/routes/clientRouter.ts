import { Router } from "express";
import { selectClient } from "../controllers/client";


const router = Router();
router.post('/', selectClient)

export default router;