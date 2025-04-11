"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsCobranzaService = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const excelColumnsConfig_1 = __importDefault(require("../utils/excelColumnsConfig"));
const createPool_1 = require("../helpers/createPool");
const CustomError_1 = require("../errors/CustomError");
const cobranza_1 = require("../database/querys/cobranza");
;
const reportsCobranzaService = async ({ userSession, PageNumber, Id_Cliente, SellsOrderCondition, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart, res }) => {
    if (!userSession) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, createPool_1.createPool)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    const data = await fetchDataInBatches({
        pool,
        PageNumber,
        Id_Cliente,
        SellsOrderCondition,
        FilterTipoDoc,
        FilterExpired,
        FilterNotExpired,
        TipoDoc,
        DateEnd,
        DateExactly,
        DateStart,
        res
    });
    await generateExcelStream(res, data);
};
exports.reportsCobranzaService = reportsCobranzaService;
const fetchDataInBatches = async ({ pool, Id_Cliente, SellsOrderCondition, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    let offset = 1;
    let results = [];
    const batchSize = 1000;
    let moreData = true;
    while (moreData) {
        try {
            let query = cobranza_1.cobranzaQuery.getCobranza;
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
            results.push(...res.recordset);
            if (res.recordset.length < batchSize) {
                moreData = false;
            }
            else {
                offset++;
            }
        }
        catch (error) {
            throw new CustomError_1.NotFoundError(`${error}`);
        }
        ;
    }
    ;
    return results;
};
const generateExcelStream = async (res, data) => {
    const workbook = new exceljs_1.default.Workbook();
    const worksheet = workbook.addWorksheet('Datos');
    worksheet.columns = excelColumnsConfig_1.default.cobranza;
    for (let i = 0; i < data.length; i++) {
        worksheet.addRow(data[i]);
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="datos.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
};
//# sourceMappingURL=resportsService.js.map