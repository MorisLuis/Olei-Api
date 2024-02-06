"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderDetails_1 = require("../controllers/orderDetails");
const router = (0, express_1.Router)();
router.post("/", orderDetails_1.postOrderDetails);
router.get("/", orderDetails_1.getOrderDetails);
exports.default = router;
//# sourceMappingURL=orderDetailsRouter.js.map