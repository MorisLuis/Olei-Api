import { Router } from "express";
import { getOrder, getAllOrders, postOrder, getOrderDetails, getTotalOrders } from "../controllers/order";
import { validateJWTWeb } from "../helpers/validate-jwt";


const router = Router();

router.post("/", validateJWTWeb, postOrder);
router.get("/details", validateJWTWeb, getOrderDetails);
router.get("/all", validateJWTWeb, getAllOrders);
router.get("/count", validateJWTWeb, getTotalOrders)
router.get("/:folio", validateJWTWeb, getOrder);

export default router;