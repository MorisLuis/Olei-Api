import { Request, Response } from 'express'
import { closeDbConnection, dbConnection, querys } from '../database';


const getUsers =  async (req: Request, res: Response) => {

    const serverWeb = req.serverweb;
    const baseWeb = req.baseweb;
    
    try {
        const pool = await dbConnection(serverWeb, baseWeb);
        const result = await pool?.request().query(querys.getAllUsers);
        const users = result?.recordset
        const total = result?.rowsAffected[0]
        res.json({
            total,
            users
        });

    } catch (error: any) {
        console.log({getUsersError: error})
        res.status(500);
        res.send(error.message);
    } finally {
        await closeDbConnection()
    }

}

export {
    getUsers
}