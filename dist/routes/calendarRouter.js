"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calendar_1 = require("../controllers/calendar");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.Router)();
router.get('/month', validateJWTWeb_1.validateJWTWeb, calendar_1.getCalendarTaskByMonth);
router.get('/day', validateJWTWeb_1.validateJWTWeb, calendar_1.getCalendarTaskByDay);
router.get('/monthAndClient', validateJWTWeb_1.validateJWTWeb, calendar_1.getCalendarTaskByMonthAndClient);
exports.default = router;
//# sourceMappingURL=calendarRouter.js.map