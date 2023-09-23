import { Request, Response } from 'express';
import { sharedData } from '../app';


const selectClient = async (req: Request, res: Response) => {

    const { Id_Cliente, Id_Almacen, Id_ListPre } = req.body;
    console.log({body: req.body})

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
        return res.status(500).send(error.message);
    }

}

export {
    selectClient
}