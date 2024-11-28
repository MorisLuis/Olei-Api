"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.celendarQuerys = void 0;
exports.celendarQuerys = {
    getCalendarTasksMonth: `
        SELECT Fecha, Titulo, 'Bitacora' AS TableType
        FROM [dbo].[BITACORACRM]
        WHERE YEAR(Fecha) = @Anio
        AND MONTH(Fecha) = @Mes

        UNION ALL

        SELECT Fecha, 
            CASE 
                WHEN TipoDoc = 1 THEN 'Factura'
                WHEN TipoDoc = 2 THEN 'Remision'
                WHEN TipoDoc = 3 THEN 'Pedido'
                ELSE 'Cotización'
            END AS Titulo, 
            'Ventas' AS TableType
        FROM [dbo].[VENTAS]
        WHERE YEAR(Fecha) = @Anio
        AND MONTH(Fecha) = @Mes;
    `,
    getCalendarTasksDay: `
        SELECT Fecha, Titulo, 'Bitacora' AS TableType, Hour, HourEnd
        FROM [dbo].[BITACORACRM]
        WHERE CAST(Fecha AS DATE) = @FechaEspecifica
        
        UNION ALL
        
        SELECT Fecha, 
            CASE 
                WHEN TipoDoc = 1 THEN 'Factura'
                WHEN TipoDoc = 2 THEN 'Remision'
                WHEN TipoDoc = 3 THEN 'Pedido'
                ELSE 'Cotización'
            END AS Titulo, 
            'Ventas' AS TableType,
            NULL AS Hour,  -- Columna Hour no existe en Ventas, se usa NULL
            NULL AS HourEnd  -- Columna HourEnd no existe en Ventas, se usa NULL
        FROM [dbo].[VENTAS]
        WHERE CAST(Fecha AS DATE) = @FechaEspecifica;
    `
};
//# sourceMappingURL=calendar.js.map