"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calendar_1 = require("../controllers/calendar");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.get('/month', validateJWT_1.validateJWTWeb, calendar_1.getCalendarTaskByMonth);
router.get('/day', validateJWT_1.validateJWTWeb, calendar_1.getCalendarTaskByDay);
router.get('/monthAndClient', validateJWT_1.validateJWTWeb, calendar_1.getCalendarTaskByMonthAndClient);
exports.default = router;
//# sourceMappingURL=calendarRouter.js.map