import { NextFunction, Request, Response } from 'express'
import { dbConnectionWeb, querys } from '../database';
import { handleGetWebSession } from '../utils/Redis/getSession';
import { UnauthorizedError } from '../errors/CustomError';

const getTables = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });
    
        if (!userFR) {
            throw new UnauthorizedError('Sesion terminada')
        }
    
        const { Serverweb, Baseweb } = userFR;
        const pool = await dbConnectionWeb(Serverweb, Baseweb);

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

    } catch (error) {
        next(error)
    }
};

export {
    getTables
}