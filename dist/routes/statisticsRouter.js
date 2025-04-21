"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateJWT_1 = require("../middleware/validateJWT");
const statistics_1 = require("../controllers/statistics");
const router = (0, express_1.Router)();
router.get('/crm-brief', validateJWT_1.validateJWTWeb, statistics_1.getCRMBrief);
exports.default = router;
//# sourceMappingURL=statisticsRouter.js.map