"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeofmovements_1 = require("../controllers/typeofmovements");
const router = (0, express_1.Router)();
router.get('/', typeofmovements_1.getTypeofmovements);
router.put('/', typeofmovements_1.changeTypeofmovements);
exports.default = router;
//# sourceMappingURL=typeofmovementsRouter.js.map