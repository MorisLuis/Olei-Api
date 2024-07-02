import { Request, Response } from 'express'
import { closeDbConnection, dbConnection, querys } from '../database';

const getTables = async (req: Request, res: Response) => {

    const serverWeb = req.serverweb;
    const baseWeb = req.baseweb;

    try {
        const pool = await dbConnection(serverWeb, baseWeb);
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
    } finally {
        await closeDbConnection()
    }
}

export {
    getTables
}