"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statistics_1 = require("../controllers/statistics");
const router = (0, express_1.Router)();
router.get("/resume", statistics_1.getBriefProductsStatistics);
router.get("/", statistics_1.getProductsStatistics);
exports.default = router;
//# sourceMappingURL=statisticsRouter.js.map