"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeofmovements_1 = require("../controllers/typeofmovements");
const validate_jwt_1 = require("../helpers/validate-jwt");
const router = (0, express_1.Router)();
router.get('/', validate_jwt_1.validateJWT, typeofmovements_1.getTypeofmovements);
router.put('/', typeofmovements_1.changeTypeofmovements);
exports.default = router;
//# sourceMappingURL=typeofmovementsRouter.js.map