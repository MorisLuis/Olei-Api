import { Router } from "express";
import { getTables } from "../controllers/tables";
import { validateJWTWeb } from "../helpers/validate-jwt";


const router = Router()

router.get("/", validateJWTWeb, getTables)

export default router;