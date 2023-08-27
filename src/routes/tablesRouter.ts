import { Router } from "express";
import { getTables } from "../controllers/tables";


const router = Router()

router.get("/", getTables)

export default router;