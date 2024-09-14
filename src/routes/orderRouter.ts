import { Router } from "express";
import { getOrder, getAllOrders, postOrder, getOrderDetails } from "../controllers/order";
import { validateJWTWeb } from "../helpers/validate-jwt";


const router = Router();

router.post("/", validateJWTWeb, postOrder);
router.get("/all", validateJWTWeb, getAllOrders);
router.get("/:folio", validateJWTWeb, getOrder);
router.get("/details", validateJWTWeb, getOrderDetails);

export default router;