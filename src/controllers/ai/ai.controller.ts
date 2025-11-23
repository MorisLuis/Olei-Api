import 'dotenv/config';
import type { Request, Response } from 'express';
import { generateSQLFromPrompt } from '../../services/ai/sqlPrompt.service';
import { executeSQLQuery } from './utils/executeSQLQuery';
import { isSafeSQL } from './utils/isSafeSQL';
import { classifyAIResponse } from './utils/classifier';

export const askAI = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Falta el prompt compa" });

        const aiText = await generateSQLFromPrompt(prompt);
        const type = classifyAIResponse(aiText);

        console.log("🤖 Respuesta de la IA:", { type, aiText });

        if (type !== "SQL") {
            return res.json({
                ok: false,
                type,
                message: aiText
            });
        }

        if (!isSafeSQL(aiText)) {
            return res.status(400).json({ error: "Consulta SQL no segura" });
        }
        const userSession = req.sessionWeb;
        const data = await executeSQLQuery({ userSession, query: aiText });
        const headers = Object.keys(data[0] ? data[0] : {});

        return res.json({
            ok: true,
            total: data.length,
            data,
            headers,
            query: aiText
        });

    } catch (error) {
        console.error("❌ Error en askAI:", error);
        return res.status(500).json({ error: "Error del servidor compa" });
    }
};

