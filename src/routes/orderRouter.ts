import { Router } from "express";
import { getOrder, getAllOrders, postOrder } from "../controllers/order";


const router = Router();

router.post("/", postOrder);
router.get("/:folio", getOrder);
router.get("/all", getAllOrders);

export default router;