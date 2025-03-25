import { Router } from "express";
import { getExcellTest } from "../controllers/utils";
import { validateJWT } from "../middleware/validateJWT";

const router = Router();

router.get("/excell", validateJWT, getExcellTest);


export default router;