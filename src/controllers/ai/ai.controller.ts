import 'dotenv/config';
import type { Request, Response } from 'express';
import { generateSQLFromPrompt } from '../../services/ai/sqlPrompt.service';
import { executeSQLQuery } from './utils/executeSQLQuery';
import { isSafeSQL } from './utils/isSafeSQL';
import { classifyAIResponse } from './utils/classifier';
import { errorResponse, successResponse } from '../../helpers/response';

export const askAI = async (req: Request, res: Response) => {
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

        return successResponse(req, res, { data, type, query: aiText, headers }, "Consulta AI exitosa", 200, { totals: { show: data.length, total: data.length }, pages: { current: 1, totalPages: 1 } });

    } catch (error) {
        return res.status(500).json({ error: `Error del servidor compa: ${error}` });
    }
};

