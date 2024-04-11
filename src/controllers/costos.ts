import { Request, Response } from 'express';
import { dbConnection } from '../database';
import sql from 'mssql';
import CostosInterface from '../interface/costos';
import { costosQuerys } from '../database/querys/costos';
import { v4 as uuidv4 } from 'uuid';

export default interface ExtendedCostosInterface extends CostosInterface {
    [key: string]: any;
    // Puedes agregar nuevas propiedades aquí, si es necesario
}

const updateCostos = async (req: Request, res: Response) => {

    try {
        const pool = await dbConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }

        try {
            const { codigo: codigoParam, Id_Marca } = req.query;
            const body: ExtendedCostosInterface = req.body;


            if (!codigoParam || !Id_Marca) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Se requieren los parámetros "codigo" e "Id_Marca" en la consulta.' });
            }

            const request = new sql.Request(transaction);
            request.input('codigo', sql.NVarChar, codigoParam);
            request.input('Id_Marca', sql.Int, Id_Marca);

            const keys = Object.keys(body);
            const query = costosQuerys.updateCostos;

            if ( body.codeRandom === "true" ) {
                const uniqueId = uuidv4();
                const codigo = uniqueId.replace(/-/g, '').substring(0, 10);
                body.CodBar = codigo
            }

            // Make forEach to create de SET of the query.
            keys.forEach((key) => {
                request.input(key, sql.NVarChar, body[key]);
            });

            await request.query(query);

            await transaction.commit();

            res.json({
                ok: true
            });
        } catch (error: any) {
            console.error({ error: error.stack || error.message });
            await transaction.rollback();
            res.status(500).json({ error: 'Hubo un error en la actualización de costos.' });
        }
    } catch (error: any) {
        console.error({ error: error.stack || error.message });
        res.status(500).json({ error: 'Hubo un error en la actualización de costos.' });
    }
};



export {
    updateCostos
}
