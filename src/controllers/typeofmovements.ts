import { Request, Response } from 'express'
import { dbConnection, querys } from '../database';
import { getUserDataWeb } from '../Storage/storageWeb';


const getTypeofmovements = async (req: Request, res: Response) => {

    const serverclientes = req.server;
    const baseclientes = req.base;

    try {
        const pool = await dbConnection(serverclientes, baseclientes);
        const TiposMovimientoResult = await pool?.request().query(querys.getTiposMovimiento);
        const TiposMovimiento = TiposMovimientoResult?.recordset

        res.json(TiposMovimiento);

    } catch (error: any) {
        res.status(500);
        res.send(error.message);
    }
}

// Temporal (!)
const changeTypeofmovements = async (req: Request, res: Response) => {

    const serverclientes = req.server;
    const baseclientes = req.base;
    const currentUser = getUserDataWeb(baseclientes)

    try {
        const pool = await dbConnection(serverclientes, baseclientes);
        const { Id_TipoMovInv } = req.body;
        const user = currentUser;

        const TipoMovimiento = await pool.request()
            .input('Id_TipoMovInv', JSON.parse(Id_TipoMovInv))
            .query(querys.getTipoDeMovimiento);

        const result = TipoMovimiento.recordset[0]

        const userData = {
            ...user,
            Id_TipoMovInv: {
                Id_TipoMovInv: result.Id_TipoMovInv,
                Accion: result.Accion,
                Descripcion: result.Descripcion,
                Id_AlmDest: result.Id_AlmDest
            },
        }

        res.json({
            user: userData
        });

    } catch (error: any) {
        console.log({error})
        res.status(500);
        res.send(error.message);
    }
}

export {
    getTypeofmovements,
    changeTypeofmovements
}