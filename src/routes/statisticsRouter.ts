import { Router } from "express";
import { getBriefProductsStatistics, getProductsStatistics } from "../controllers/statistics";

const router = Router();

router.get("/resume", getBriefProductsStatistics);
router.get("/", getProductsStatistics);


export default router;