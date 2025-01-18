import { Router } from "express";
import { getBanner, getUtils } from "../controllers/utils";
import { validateJWTWeb } from "../helpers/validate-jwt";

const router = Router();

router.get('/banner', validateJWTWeb, getBanner)
router.get("/", getUtils);


export default router;