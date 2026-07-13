import { Router } from "express";
import { getTables } from "../controllers/tables";
import { validateJWTClient } from "../middleware/validateJWT";


const router = Router()

router.get("/", validateJWTClient, getTables)

export default router;