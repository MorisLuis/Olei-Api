import { Router } from "express";
import { getExcellTest } from "../controllers/utils";
import { validateJWTClient } from "../middleware/validateJWT";

const router = Router();

router.get("/excell", validateJWTClient, getExcellTest);


export default router;