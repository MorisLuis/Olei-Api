import { Request, Response } from 'express';
import { sharedData } from '../app';
import { dbConnection } from '../database';
import UserInterface from '../interface/user';
import { getUsers } from './users';


const selectClient = async (req: Request, res: Response) => {

    const { Id_Cliente, Id_Almacen, Id_ListPre } = req.body;
    //const connection = sharedData?.userConnection?.connection;

    try {

        sharedData.currentClient = {
            client: {
                Id_Almacen: Id_Almacen,
                Id_Cliente: Id_Cliente,
                Id_ListPre: Id_ListPre
            }
        };


        return res.json({
            client: sharedData.currentClient.client
        })
    } catch (error: any) {
        console.log({error})
        return res.status(500).send(error.message);
    }

}

export {
    selectClient
}