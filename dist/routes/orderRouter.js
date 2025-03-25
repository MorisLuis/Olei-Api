"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_1 = require("../controllers/order");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.post("/", validateJWT_1.validateJWTWeb, order_1.postOrder);
router.get("/details", validateJWT_1.validateJWTWeb, order_1.getOrderDetails);
router.get("/details/total", validateJWT_1.validateJWTWeb, order_1.getTotalOrderDetails);
router.get("/all", validateJWT_1.validateJWTWeb, order_1.getAllOrders);
router.get("/all/count", validateJWT_1.validateJWTWeb, order_1.getTotalAllOrders);
router.get("/:folio", validateJWT_1.validateJWTWeb, order_1.getOrder);
exports.default = router;
//# sourceMappingURL=orderRouter.js.map