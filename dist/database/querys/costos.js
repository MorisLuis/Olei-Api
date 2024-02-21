"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.costosQuerys = void 0;
exports.costosQuerys = {
    updateCostos: `
        UPDATE [dbo].[COSTOS]
        SET CodBar=@CodBar
        WHERE Codigo=@Codigo AND Id_Marca=@Id_Marca
    `
};
//# sourceMappingURL=costos.js.map