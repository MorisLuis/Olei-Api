import 'dotenv/config';
import type { Request, Response } from 'express';
import { generateSQLFromPrompt } from '../../services/ai/sqlPrompt.service';
import { executeSQLQuery } from './utils/executeSQLQuery';
import { isSafeSQL } from './utils/isSafeSQL';


export const askAI = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Falta el prompt compa" });

        const sql = await generateSQLFromPrompt(prompt);
        console.log({ sql})

        if (!isSafeSQL(sql)) {
            return res.status(400).json({ error: "Consulta SQL no segura" });
        }
        const userSession = req.sessionWeb;
        const data = await executeSQLQuery({ userSession, query: sql });


        return res.json({
            ok: true,
            sql,
            data
        });
    } catch (error) {
        console.error("❌ Error en askAI:", error);
        return res.status(500).json({ error: "Error del servidor compa" });
    }
};

