"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errors_1 = require("../controllers/errors");
const router = (0, express_1.Router)();
router.post('/', errors_1.handleErrors);
exports.default = router;
//# sourceMappingURL=errorsRouter.js.map