import { Router } from "express";
import { getExcellTest } from "../controllers/utils";
import { validateJWTWeb } from "../helpers/validate-jwt";

const router = Router();

router.get("/excell", validateJWTWeb, getExcellTest);


export default router;