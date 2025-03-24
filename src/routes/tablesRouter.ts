import { Router } from "express";
import { getTables } from "../controllers/tables";
import { validateJWT } from "../middleware/validateJWT";


const router = Router()

router.get("/", validateJWT, getTables)

export default router;