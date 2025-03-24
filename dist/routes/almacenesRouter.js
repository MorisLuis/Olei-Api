"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const almacenes_1 = require("../controllers/almacenes");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.get('/', validateJWT_1.validateJWT, almacenes_1.getAlmacenes);
router.get('/update', validateJWT_1.validateJWT, almacenes_1.updateAlmacenInRedis);
exports.default = router;
//# sourceMappingURL=almacenesRouter.js.map