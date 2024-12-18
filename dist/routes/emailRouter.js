"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_1 = require("../controllers/email");
const router = (0, express_1.Router)();
router.post('/', email_1.sendEmail);
exports.default = router;
//# sourceMappingURL=emailRouter.js.map