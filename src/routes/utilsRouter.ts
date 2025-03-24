import { Router } from "express";
import { getExcellTest, getBanner } from "../controllers/utils";
import { validateJWT, validateJWTWeb } from "../middleware/validateJWT";

const router = Router();

router.get('/banner', validateJWTWeb, getBanner)
router.get("/excell", validateJWT, getExcellTest);


export default router;