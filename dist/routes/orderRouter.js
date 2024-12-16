"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_1 = require("../controllers/order");
const validate_jwt_1 = require("../helpers/validate-jwt");
const router = (0, express_1.Router)();
router.post("/", validate_jwt_1.validateJWTWeb, order_1.postOrder);
router.get("/details", validate_jwt_1.validateJWTWeb, order_1.getOrderDetails);
router.get("/details/total", validate_jwt_1.validateJWTWeb, order_1.getTotalOrderDetails);
router.get("/all", validate_jwt_1.validateJWTWeb, order_1.getAllOrders);
router.get("/count", validate_jwt_1.validateJWTWeb, order_1.getTotalOrders);
router.get("/:folio", validate_jwt_1.validateJWTWeb, order_1.getOrder);
exports.default = router;
//# sourceMappingURL=orderRouter.js.map