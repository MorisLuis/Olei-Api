import type { NextFunction, Request, Response } from 'express'
import { dbConnectionWeb } from '../database';
import { generalQuerys } from '../database/querys/general';

const getTables = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void>  => {

    try {
        // Get session from REDIS.
        const userSession = req.sessionWeb

        const { ServidorSQL, BaseSQL } = userSession;
        const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

        const FamiliasResult = await pool?.request().query(generalQuerys.getFamilias);
        const Familias = FamiliasResult?.recordset.map(familia => familia.Nombre);

        const MarcaResult = await pool?.request().query(generalQuerys.getMarcas);
        const Marca = MarcaResult?.recordset.map(marca => marca.Nombre);

        const FolioResult = await pool?.request().query(generalQuerys.getFolios);
        const Folio = FolioResult?.recordset.map(folio => folio.Codigo);

        return res.json({
            Familias,
            Marca,
            Folio
        });

    } catch (error) {
        return next(error)
    }
};

export {
    getTables
}