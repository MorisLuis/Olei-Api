import { Router } from "express";
import { getUtils } from "../controllers/utils";

const router = Router();

router.get("/", getUtils);


export default router;