"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bitacora_1 = require("../controllers/bitacora");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.Router)();
router.get('/', validateJWTWeb_1.validateJWTWeb, bitacora_1.getMeetings);
router.get('/total', validateJWTWeb_1.validateJWTWeb, bitacora_1.getTotalMeetings);
router.get('/:id', validateJWTWeb_1.validateJWTWeb, bitacora_1.getMeetingById);
router.put('/:id', validateJWTWeb_1.validateJWTWeb, bitacora_1.updateMeeting);
router.post('/', validateJWTWeb_1.validateJWTWeb, bitacora_1.postMeeting);
router.delete('/:id', validateJWTWeb_1.validateJWTWeb, bitacora_1.deleteMeeting);
exports.default = router;
//# sourceMappingURL=meetingRouter.js.map