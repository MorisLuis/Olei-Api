"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../controllers/utils");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.get('/banner', validateJWT_1.validateJWTWeb, utils_1.getBanner);
router.get("/excell", validateJWT_1.validateJWT, utils_1.getExcellTest);
exports.default = router;
//# sourceMappingURL=utilsRouter.js.map