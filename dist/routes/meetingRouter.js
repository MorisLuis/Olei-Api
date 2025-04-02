"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bitacora_1 = require("../controllers/bitacora");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.get('/', validateJWT_1.validateJWTWeb, bitacora_1.getMeetings);
router.get('/total', validateJWT_1.validateJWTWeb, bitacora_1.getTotalMeetings);
router.get('/:id', validateJWT_1.validateJWTWeb, bitacora_1.getMeetingById);
router.put('/:id', validateJWT_1.validateJWTWeb, bitacora_1.updateMeeting);
router.post('/', validateJWT_1.validateJWTWeb, bitacora_1.postMeeting);
router.delete('/:id', validateJWT_1.validateJWTWeb, bitacora_1.deleteMeeting);
exports.default = router;
//# sourceMappingURL=meetingRouter.js.map