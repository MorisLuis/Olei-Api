import { Router } from "express";
import { getOrderDetails, postOrderDetails } from "../controllers/orderDetails";
import { validateJWTWeb } from "../helpers/validate-jwt";


const router = Router();

router.post("/", validateJWTWeb, postOrderDetails);
router.get("/", validateJWTWeb, getOrderDetails);

export default router;