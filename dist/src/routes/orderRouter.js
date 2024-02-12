"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_1 = require("../controllers/order");
const router = (0, express_1.Router)();
router.post("/", order_1.postOrder);
router.get("/all", order_1.getAllOrders);
router.get("/:folio", order_1.getOrder);
exports.default = router;
//# sourceMappingURL=orderRouter.js.map