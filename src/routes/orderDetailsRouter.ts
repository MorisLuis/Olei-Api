import { Router } from "express";
import { getOrderDetails, postOrderDetails } from "../controllers/orderDetails";


const router = Router();

router.post("/", postOrderDetails);
router.get("/", getOrderDetails);

export default router;