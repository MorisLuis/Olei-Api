"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_1 = require("../controllers/order");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.Router)();
router.post("/", validateJWTWeb_1.validateJWTWeb, order_1.postOrder);
router.get("/details", validateJWTWeb_1.validateJWTWeb, order_1.getOrderDetails);
router.get("/details/total", validateJWTWeb_1.validateJWTWeb, order_1.getTotalOrderDetails);
router.get("/all", validateJWTWeb_1.validateJWTWeb, order_1.getAllOrders);
router.get("/all/count", validateJWTWeb_1.validateJWTWeb, order_1.getTotalAllOrders);
router.get("/:folio", validateJWTWeb_1.validateJWTWeb, order_1.getOrder);
exports.default = router;
//# sourceMappingURL=orderRouter.js.map