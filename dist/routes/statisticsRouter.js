"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statistics_1 = require("../controllers/statistics");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.Router)();
router.get('/crm-brief', validateJWTWeb_1.validateJWTWeb, statistics_1.getCRMBrief);
exports.default = router;
//# sourceMappingURL=statisticsRouter.js.map