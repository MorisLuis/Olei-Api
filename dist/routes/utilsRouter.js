"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../controllers/utils");
const validateJWT_1 = require("../middleware/validateJWT");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.Router)();
router.get('/banner', validateJWTWeb_1.validateJWTWeb, utils_1.getBanner);
router.get("/excell", validateJWT_1.validateJWT, utils_1.getExcellTest);
exports.default = router;
//# sourceMappingURL=utilsRouter.js.map