import { Request, Response } from 'express';
import { generateWebJWT } from '../helpers/generate-jwt';
import { setClientData } from '../Storage/storageWeb';
import { closeDbConnection } from '../database';

const selectClient = async (req: Request, res: Response) => {

    const baseweb = req.baseweb;
    const serverweb = req.serverweb;
    const id = req.id;
    const rol = req.rol;

    const { Id_Cliente, Id_Almacen, Id_ListPre } = req.body;

    try {

        const client = {
            Id_Almacen: Id_Almacen,
            Id_Cliente: Id_Cliente,
            Id_ListPre: Id_ListPre,
            IsEmploye: true
        }

        setClientData(`${baseweb}_${Id_Cliente}`, client)

        const token = await generateWebJWT({
            id,
            rol,
            serverweb,
            baseweb,
            clientid: Id_Cliente
        });

        return res.json({
            client,
            token
        })

    } catch (error: any) {
        console.log({error})
        return res.status(500).send(error.message);
    } finally {
        await closeDbConnection()
    }

}

export {
    selectClient
}