"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const almacenes_1 = require("../controllers/almacenes");
const validate_jwt_1 = require("../helpers/validate-jwt");
const router = (0, express_1.Router)();
router.get('/', validate_jwt_1.validateJWT, almacenes_1.getAlmacenes);
router.get('/update', validate_jwt_1.validateJWT, almacenes_1.updateAlmacenInRedis);
exports.default = router;
//# sourceMappingURL=almacenesRouter.js.map