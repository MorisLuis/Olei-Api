// excelColumnsConfig.ts

interface ExcelColumn {
    header: string;
    key: string;
    width?: number;
}

const excelColumnsConfig: Record<string, ExcelColumn[]> = {
    cobranza: [
        { header: 'Codigo', key: 'Codigo', width: 10 },
        { header: 'Descripcion', key: 'Descripcion', width: 30 },
        { header: 'Id_Familia', key: 'Id_Familia', width: 10 },
    ],
    ventas: [
        { header: 'Fecha', key: 'Fecha', width: 15 },
        { header: 'Producto', key: 'Producto', width: 20 },
        { header: 'Cantidad', key: 'Cantidad', width: 10 },
        { header: 'Total', key: 'Total', width: 15 },
    ],
    inventarios: [
        { header: 'Almacen', key: 'Almacen', width: 20 },
        { header: 'Producto', key: 'Producto', width: 25 },
        { header: 'Stock', key: 'Stock', width: 10 },
    ],
};

export default excelColumnsConfig;
