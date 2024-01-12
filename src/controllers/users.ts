import { Request, Response } from 'express'
import { dbConnection, querys } from '../database';


const getUsers =  async (req: Request, res: Response) => {

    const pool = await dbConnection();

    try {
        const result = await pool?.request().query(querys.getAllUsers);
        const users = result?.recordset
        const total = result?.rowsAffected[0]
        res.json({
            total,
            users
        });

    } catch (error: any) {
        res.status(500);
        res.send(error.message);
    }

}

export {
    getUsers
}