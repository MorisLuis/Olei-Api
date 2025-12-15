"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToCSV = exports.askAI = void 0;
require("dotenv/config");
const sqlPrompt_service_1 = require("../../services/ai/sqlPrompt.service");
const executeSQLQuery_1 = require("./utils/executeSQLQuery");
const isSafeSQL_1 = require("./utils/isSafeSQL");
const classifier_1 = require("./utils/classifier");
const response_1 = require("../../helpers/response");
const redisClient_1 = __importDefault(require("../../config/redisClient"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const askAI = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt)
            return (0, response_1.errorResponse)(res, 'Falta el promtp', 400);
        const aiText = await (0, sqlPrompt_service_1.generateSQLFromPrompt)(prompt);
        const type = (0, classifier_1.classifyAIResponse)(aiText);
        if (type !== "SQL") {
            return (0, response_1.errorResponse)(res, `Is not SQL: ${aiText}`, 400);
        }
        if (!(0, isSafeSQL_1.isSafeSQL)(aiText)) {
            return (0, response_1.errorResponse)(res, 'Consulta SQL no segura', 400);
        }
        const userSession = req.sessionWeb;
        const data = await (0, executeSQLQuery_1.executeSQLQuery)({ userSession, query: aiText });
        const headers = Object.keys(data[0] ? data[0] : {});
        const queryId = (0, uuid_1.v4)();
        await redisClient_1.default.set(`agent:sql:${queryId}`, JSON.stringify({ sql: aiText }), "EX", 60 * 10);
        return (0, response_1.successResponse)(req, res, { data, type, headers, queryId }, "Consulta AI exitosa", 200, { totals: { show: data.length, total: data.length }, pages: { current: 1, totalPages: 1 } });
    }
    catch (error) {
        return res.status(500).json({ error: `Error del servidor compa: ${error}` });
    }
};
exports.askAI = askAI;
const exportToCSV = async (req, res) => {
    try {
        const { queryId } = req.query;
        const record = await redisClient_1.default.get(`agent:sql:${queryId}`);
        if (!record) {
            return (0, response_1.errorResponse)(res, 'Consulta no encontrada o expirada', 404);
        }
        let { sql } = JSON.parse(record);
        sql = sql.replace(/\boffset\s+\d+\s+rows\s+fetch\s+next\s+\d+\s+rows\s+only\s*;?/i, '');
        const userSession = req.sessionWeb;
        const data = await (0, executeSQLQuery_1.executeSQLQuery)({ userSession, query: sql });
        const headers = Object.keys(data[0] ? data[0] : {});
        const csvRows = [];
        csvRows.push(headers.join(','));
        for (const row of data) {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        const csvData = csvRows.join('\n');
        const exportDir = path_1.default.join(process.cwd(), "tmp", "exports");
        if (!fs_1.default.existsSync(exportDir)) {
            fs_1.default.mkdirSync(exportDir, { recursive: true });
        }
        const filePath = path_1.default.join(exportDir, `report-${Date.now()}.csv`);
        fs_1.default.writeFileSync(filePath, csvData);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=reporte.csv");
        return res.status(200).send(csvData);
    }
    catch (error) {
        return res.status(500).json({ error: `Error del servidor compa: ${error}` });
    }
};
exports.exportToCSV = exportToCSV;
//# sourceMappingURL=ai.controller.js.map