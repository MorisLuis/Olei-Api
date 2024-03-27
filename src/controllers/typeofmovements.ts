import { Request, Response } from 'express'
import { dbConnection, querys } from '../database';
import { sharedData } from '..';
import UserInterface from '../interface/user';


const getTypeofmovements = async (req: Request, res: Response) => {

    try {
        const pool = await dbConnection();
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
    try {
        const pool = await dbConnection();
        const { Id_TipoMovInv } = req.body;
        const user = sharedData?.currentUser?.user as UserInterface;

        const TipoMovimiento = await pool.request()
            .input('Id_TipoMovInv', JSON.parse(Id_TipoMovInv))
            .query(querys.getTipoDeMovimiento);

        const result = TipoMovimiento.recordset[0]

        sharedData.currentUser = {
            user: {
                ...user,
                Id_TipoMovInv: {
                    Id_TipoMovInv: result.Id_TipoMovInv,
                    Accion: result.Accion,
                    Descripcion: result.Descripcion,
                    Id_AlmDest: result.Id_AlmDest
                },
            }
        }

        res.json({
            user: sharedData.currentUser.user
        });

    } catch (error: any) {
        res.status(500);
        res.send(error.message);
    }
}

export {
    getTypeofmovements,
    changeTypeofmovements
}