import { Request, Response } from 'express'
import { dbConnection } from '../database';
import { statisticsQuery } from '../database/querys/statistics';

interface IRecordSet {
    Id_Almacen: number;
    Codigo: string;
    Id_Marca: number;
    Existencia: number;
    Estatus: string;
}

interface IResult {
    recordsets: IRecordSet[];
}

const getBriefProductsStatistics = async (req: Request, res: Response) => {

    const pool = await dbConnection();

    if (!pool) {
        return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
    }

    try {
        const query = statisticsQuery.getProductsStatistics;

        const request: any = await pool.request()
            .query(query);

        const result: IResult = request.recordsets[0];

        res.json(result);

    } catch (error: any) {
        res.status(500);
        res.send(error.message);
    }
}

const getProductsStatistics = async (req: Request, res: Response) => {
    const pool = await dbConnection();

    if (!pool) {
        return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
    }

    const { PageNumber, PageSize, path } = req.query;
    const pathString = path as string;

    console.log({
        PageNumber, PageSize, path
    })

    try {
        const queryFunctions: Record<string, string> = {
            WithoutStock: statisticsQuery.getProductsWithoutStock,
            AlmostWithoutStock: statisticsQuery.getProductsAlmostWithoutStock,
            WithLessThan5: statisticsQuery.getProductsWithLessThan5,
            Between5And16: statisticsQuery.getProductsBetween5And16,
            MoreThan16: statisticsQuery.getProductsWithMoreThan16,
        };

        const query = queryFunctions[pathString];

        if (!query) {
            return res.status(400).json({ error: 'Invalid path' });
        }

        const request: any = await pool.request()
            .input('PageSize', Number(PageSize))
            .input('PageNumber', PageNumber)
            .query(query);

        const result: IResult = request.recordsets[0];
        return res.json(result);

    } catch (error: any) {
        res.status(500).send(error.message);
    }
};
export {
    getBriefProductsStatistics,
    getProductsStatistics
}