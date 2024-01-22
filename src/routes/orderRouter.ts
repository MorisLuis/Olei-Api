import { Router } from "express";
import { getOrder, getAllOrders, postOrder } from "../controllers/order";


const router = Router();

router.post("/", postOrder);
router.get("/all", getAllOrders);
router.get("/:folio", getOrder);

export default router;