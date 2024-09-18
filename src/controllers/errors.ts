import { Request, Response } from 'express';
import { dbConnectionMain, querys } from '../database';
import sql from 'mssql';

const handleErrors = async (req: Request, res: Response) => {

    try {
        const pool = await dbConnectionMain();
        const { From, Message, Id_Usuario, Metodo, code } = req.body;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        const request = new sql.Request(transaction);

        let query = querys.postError;

        const result = await request
            .input('From', sql.VarChar, From || '')
            .input('Message', sql.VarChar, Message || '')
            .input('Id_Usuario', sql.VarChar, Id_Usuario || '')
            .input('Metodo', sql.VarChar, Metodo || '')
            .input('code', sql.VarChar, code || '')
            .query(query);

        await transaction.commit();

        return res.json({
            ok: true
        })

    } catch (error: any) {
        console.log({ error })
        return res.status(500).send(error.message);
    }

}

export {
    handleErrors
}