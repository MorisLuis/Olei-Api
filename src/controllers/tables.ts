import { Request, Response } from 'express'
import { closeDbConnection, dbConnection, querys } from '../database';
import { handleGetWebSession } from '../utils/Redis/getSession';

const getTables = async (req: Request, res: Response) => {

    // Get session from REDIS.
    const sessionId = req.sessionRedis
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { Serverweb, Baseweb } = userFR;

    try {
        const pool = await dbConnection(Serverweb, Baseweb);
        const FamiliasResult = await pool?.request().query(querys.getFamilias);
        const Familias = FamiliasResult?.recordset.map(familia => familia.Nombre);

        const MarcaResult = await pool?.request().query(querys.getMarcas);
        const Marca = MarcaResult?.recordset.map(marca => marca.Nombre);

        const FolioResult = await pool?.request().query(querys.getFolios);
        const Folio = FolioResult?.recordset.map(folio => folio.Codigo);

        res.json({
            Familias,
            Marca,
            Folio
        });

    } catch (error: any) {
        res.status(500);
        res.send(error.message);
    }
}

export {
    getTables
}