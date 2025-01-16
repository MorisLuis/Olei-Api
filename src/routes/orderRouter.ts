import { Router } from "express";
import { getOrder, getAllOrders, postOrder, getOrderDetails, getTotalAllOrders, getTotalOrderDetails } from "../controllers/order";
import { validateJWTWeb } from "../helpers/validate-jwt";


const router = Router();

router.post("/", validateJWTWeb, postOrder);

router.get("/details", validateJWTWeb, getOrderDetails);
router.get("/details/total", validateJWTWeb, getTotalOrderDetails);

router.get("/all", validateJWTWeb, getAllOrders);
router.get("/all/count", validateJWTWeb, getTotalAllOrders)

router.get("/:folio", validateJWTWeb, getOrder);

export default router;