"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_jwt_1 = require("../helpers/validate-jwt");
const calendar_1 = require("../controllers/calendar");
const router = (0, express_1.Router)();
router.get('/month', validate_jwt_1.validateJWTWeb, calendar_1.getCalendarTaskByMonth);
router.get('/day', validate_jwt_1.validateJWTWeb, calendar_1.getCalendarTaskByDay);
router.get('/monthAndClient', validate_jwt_1.validateJWTWeb, calendar_1.getCalendarTaskByMonthAndClient);
exports.default = router;
//# sourceMappingURL=calendarRouter.js.map