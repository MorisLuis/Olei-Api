"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectClient = void 0;
const app_1 = require("../app");
const selectClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { Id_Cliente, Id_Almacen, Id_ListPre } = req.body;
    const connection = (_a = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.userConnection) === null || _a === void 0 ? void 0 : _a.connection;
    try {
        app_1.sharedData.currentClient = {
            client: {
                Id_Almacen: Id_Almacen,
                Id_Cliente: Id_Cliente,
                Id_ListPre: Id_ListPre
            }
        };
        return res.json({
            client: app_1.sharedData.currentClient.client
        });
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
});
exports.selectClient = selectClient;
//# sourceMappingURL=client.js.map