"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_jwt_1 = require("../helpers/validate-jwt");
const bitacora_1 = require("../controllers/bitacora");
const router = (0, express_1.Router)();
router.get('/', validate_jwt_1.validateJWTWeb, bitacora_1.getMeetings);
router.get('/total', validate_jwt_1.validateJWTWeb, bitacora_1.getTotalMeetings);
router.get('/:id', validate_jwt_1.validateJWTWeb, bitacora_1.getMeetingById);
router.put('/:id', validate_jwt_1.validateJWTWeb, bitacora_1.updateMeeting);
router.post('/', validate_jwt_1.validateJWTWeb, bitacora_1.postMeeting);
router.delete('/:id', validate_jwt_1.validateJWTWeb, bitacora_1.deleteMeeting);
exports.default = router;
//# sourceMappingURL=bitacoraRouter.js.map