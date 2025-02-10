"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlamacenQuery = void 0;
exports.AlamacenQuery = {
    getAlmacenes: `
        SELECT TOP (100) 
            [Id_Almacen],
            [IdOLEI],
            [Nombre]
        FROM [dbo].[ALMACENES]
        ORDER BY [Id_Almacen]
    `,
    getAlmacenById: `
        SELECT 
            [Id_Almacen],
            [IdOLEI],
            [Nombre]
        FROM [dbo].[ALMACENES]
        WHERE Id_Almacen = @Id_Almacen
    `
};
//# sourceMappingURL=almacen.js.map