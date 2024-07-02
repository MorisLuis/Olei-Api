import { Router } from "express";
import { getOrder, getAllOrders, postOrder } from "../controllers/order";
import { validateJWTWeb } from "../helpers/validate-jwt";


const router = Router();

router.post("/", validateJWTWeb, postOrder);
router.get("/all", validateJWTWeb, getAllOrders);
router.get("/:folio", validateJWTWeb, getOrder);

export default router;