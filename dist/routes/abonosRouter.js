"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const abonos_controller_1 = require("../controllers/abonos/abonos.controller");
const router = (0, express_1.Router)();
router.get('/', validateJWTWeb_1.validateJWTWeb, abonos_controller_1.getAbonos);
router.get('/:folio', validateJWTWeb_1.validateJWTWeb, abonos_controller_1.getAbonoById);
router.get('/details/:folio', validateJWTWeb_1.validateJWTWeb, abonos_controller_1.getAbonoDetails);
exports.default = router;
//# sourceMappingURL=abonosRouter.js.map