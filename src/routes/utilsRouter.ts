import { Router } from "express";
import { getExcellTest, getBanner } from "../controllers/utils";
import { validateJWTWeb } from "../helpers/validate-jwt";

const router = Router();

router.get('/banner', validateJWTWeb, getBanner)
router.get("/excell", validateJWTWeb, getExcellTest);


export default router;