import { Router } from "express";
import { getExcellTest, getBanner } from "../controllers/utils";
import { validateJWTClient } from "../middleware/validateJWT";
import { validateJWTWeb } from "../middleware/validateJWTWeb";

const router = Router();

router.get('/banner', validateJWTWeb, getBanner)
router.get("/excell", validateJWTClient, getExcellTest);


export default router;