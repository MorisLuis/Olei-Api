"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderDetails_1 = require("../controllers/orderDetails");
const validate_jwt_1 = require("../helpers/validate-jwt");
const router = (0, express_1.Router)();
router.post("/", validate_jwt_1.validateJWTWeb, orderDetails_1.postOrderDetails);
router.get("/", validate_jwt_1.validateJWTWeb, orderDetails_1.getOrderDetails);
exports.default = router;
//# sourceMappingURL=orderDetailsRouter.js.map