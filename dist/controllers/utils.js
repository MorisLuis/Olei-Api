"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExcellTest = exports.getUtils = exports.getBanner = void 0;
const database_1 = require("../database");
const getSession_1 = require("../utils/Redis/getSession");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const sells_1 = require("../database/querys/sells");
const exceljs_1 = __importDefault(require("exceljs"));
const getBanner = async (req, res) => {
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    ;
    const database = userFR?.Baseweb;
    const databaseSplit = database?.split('_');
    const newPath = databaseSplit?.[1]?.toLowerCase().trim();
    const banner = newPath ? `https://oleistorage.blob.core.windows.net/${newPath}/BANNER.png` : '/Banner_olei.png';
    res.json({
        banner
    });
};
exports.getBanner = getBanner;
const getUtils = async (req, res) => {
    return new Promise((resolve, reject) => {
        reject('Error en la promesa!');
    });
};
exports.getUtils = getUtils;
const getExcellTest = async (req, res) => {
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    ;
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    try {
        // Obtenemos los datos de la base de datos en lotes
        const data = await fetchDataInBatches(pool);
        // Generamos el archivo Excel y lo enviamos como respuesta
        await generateExcelStream(res, data);
    }
    catch (error) {
        console.log({ error });
    }
};
exports.getExcellTest = getExcellTest;
const fetchDataInBatches = async (pool) => {
    let offset = 1;
    let results = [];
    const batchSize = 1000;
    let moreData = true;
    while (moreData) {
        const Id_Cliente = 1;
        const SellsOrderCondition = 'Fecha';
        const FilterTipoDoc = 0;
        const FilterExpired = 0;
        const FilterNotExpired = 0;
        const DateStart = undefined;
        const DateEnd = undefined;
        const DateExactly = undefined;
        const TipoDoc = 0;
        try {
            let query = sells_1.sellsQuery.getCobranza;
            const res = await pool.request()
                .input('PageNumber', offset)
                .input('PageSize', batchSize)
                .input('Id_Cliente', Id_Cliente)
                .input('OrderCondition', SellsOrderCondition)
                .input('FilterTipoDoc', FilterTipoDoc)
                .input('FilterExpired', FilterExpired)
                .input('FilterNotExpired', FilterNotExpired)
                .input('DateStart', DateStart)
                .input('DateEnd', DateEnd)
                .input('DateExactly', DateExactly)
                .input('TipoDoc', TipoDoc)
                .query(query);
            results.push(...res.recordset); // Añadimos los datos del lote a los resultados finales
            // Si el lote trae menos registros de los solicitados, significa que no hay más datos
            if (res.recordset.length < batchSize) {
                moreData = false;
            }
            else {
                offset++; // Avanzamos el offset para el siguiente lote
            }
        }
        catch (error) {
            console.log({ error });
        }
        ;
    }
    ;
    return results;
};
const generateExcelStream = async (res, data) => {
    const workbook = new exceljs_1.default.Workbook(); // Crea una nueva instancia del libro de Excel
    const worksheet = workbook.addWorksheet('Datos'); // Añadimos una hoja llamada 'Datos'
    // Definimos las columnas en el archivo Excel
    worksheet.columns = [
        { header: 'Codigo', key: 'Codigo', width: 10 },
        { header: 'Descripcion', key: 'Descripcion', width: 30 },
        { header: 'Id_Familia', key: 'Id_Familia', width: 10 },
    ];
    // Añadimos los datos al archivo Excel en un flujo de escritura
    for (let i = 0; i < data.length; i++) {
        worksheet.addRow(data[i]);
    }
    // Configuramos las cabeceras para que el navegador descargue el archivo como Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="datos.xlsx"');
    // Escribimos el archivo Excel en la respuesta HTTP usando un flujo (stream)
    await workbook.xlsx.write(res); // Se escribe directamente en la respuesta
    res.end(); // Terminamos la respuesta
};
//# sourceMappingURL=utils.js.map