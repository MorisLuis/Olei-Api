"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeofmovements_1 = require("../controllers/typeofmovements");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.get('/', validateJWT_1.validateJWT, typeofmovements_1.getTypeofmovements);
exports.default = router;
//# sourceMappingURL=typeofmovementsRouter.js.map