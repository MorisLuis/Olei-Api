import 'dotenv/config';
import type { Request, Response } from 'express';
import { generateSQLFromPrompt } from '../../services/ai/sqlPrompt.service';
import { executeSQLQuery } from './utils/executeSQLQuery';
import { isSafeSQL } from './utils/isSafeSQL';
import { classifyAIResponse } from './utils/classifier';
import { errorResponse, successResponse } from '../../helpers/response';
import redisClient from '../../config/redisClient';
import { v4 } from 'uuid';
import path from 'path';
import fs from "fs";

export const askAI = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { prompt } = req.body;
        if (!prompt) return errorResponse(res, 'Falta el promtp', 400);

        const aiText = await generateSQLFromPrompt(prompt);
        const type = classifyAIResponse(aiText);

        if (type !== "SQL") {
            return errorResponse(res, `Is not SQL: ${aiText}`, 400);
        }

        if (!isSafeSQL(aiText)) {
            return errorResponse(res, 'Consulta SQL no segura', 400);
        }

        const userSession = req.sessionWeb;
        const data = await executeSQLQuery({ userSession, query: aiText });
        const headers = Object.keys(data[0] ? data[0] : {});

        const queryId = v4();
        await redisClient.set(
            `agent:sql:${queryId}`,
            JSON.stringify({ sql: aiText, request: prompt }),
            "EX",
            60 * 10
        );

        console.log({ queryId });

        return successResponse(req, res, { data, type, headers, queryId }, "Consulta AI exitosa", 200, { totals: { show: data.length, total: data.length }, pages: { current: 1, totalPages: 1 } });

    } catch (error) {
        return res.status(500).json({ error: `Error del servidor compa: ${error}` });
    }
};

export const exportToCSV = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { queryId } = req.query;
        const record = await redisClient.get(`agent:sql:${queryId}`);
        if (!record) {
            return errorResponse(res, 'Consulta no encontrada o expirada', 404);
        }
        let { sql } = JSON.parse(record);
        sql = sql.replace(/\boffset\s+\d+\s+rows\s+fetch\s+next\s+\d+\s+rows\s+only\s*;?/i, '');

        const userSession = req.sessionWeb;
        const data = await executeSQLQuery({ userSession, query: sql });
        const headers = Object.keys(data[0] ? data[0] : {});
        const csvRows: string[] = [];
        csvRows.push(headers.join(','));
        for (const row of data) {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        const csvData = csvRows.join('\n');
        const exportDir = path.join(process.cwd(), "tmp", "exports");
		if (!fs.existsSync(exportDir)) {
			fs.mkdirSync(exportDir, { recursive: true });
		}

		const filePath = path.join(exportDir, `report-${Date.now()}.csv`);
		fs.writeFileSync(filePath, csvData);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=reporte.csv");
        return res.status(200).send(csvData);
        

    } catch (error) {
        return res.status(500).json({ error: `Error del servidor compa: ${error}` });

    }
}
