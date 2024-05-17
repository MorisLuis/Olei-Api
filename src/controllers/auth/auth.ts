import { Request, Response } from 'express';

import { closeDbConnection, dbConnection, querys } from '../../database';
import moment from 'moment';
import { generateJWT, generateJWTDB } from '../../helpers/generate-jwt';
import { sharedData } from '../..';
import config from '../../config';

const loginDB = async (req: Request, res: Response) => {

    try {
        const {servidor, database} = req.body;

        console.log({servidor, database})

        // STEP 1 - LOGIN
        const mainPool = await dbConnection(servidor, database);

        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }

        const tokenDB = await generateJWTDB({ servidor, database });

        console.log({tokenDB})

        sharedData.userConnection = {
            connection: {
                user: config.dbUser,
                password: config.dbPassword,
                server: (mainPool as any)['config'].server,
                database: (mainPool as any)['config'].database
            }
        };

        console.log({
            servidor,
            database
        })

        return res.json({
            tokenDB,
            userDB: {
                servidor,
                database
            }
        });

    } catch (error: any) {
        console.log({ error })
        return res.status(500).send(error.message);
    }
};

const login = async (req: Request, res: Response) => {

    try {
        // STEP 1 - LOGIN
        const mainPool = await dbConnection(sharedData.userConnection?.connection.server, sharedData.userConnection?.connection.database);

        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }

        // Search for the user in the database using their email.
        const { email, password } = req.body;

        const user = await getUserByEmail(mainPool, email);

        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrada' });
        }

        if (user.Password.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }


        // Get the user's subscription expiration date.
        /* const dueDate = await getUserSubscriptionDueDate(mainPool, user.Id_ClienteDBCLIENTES);
        if (isSubscriptionExpired(dueDate)) {
            return res.status(401).json({ error: 'Subscripción ha expirado' });
        } */

        const token = await generateJWT({ id: user.EMail, rol: user.Id_Perfil });


        // Update sharedData.userConnection for global access.
        sharedData.userConnection = {
            connection: {
                user: config.dbUser,
                password: config.dbPassword,
                server: sharedData.userConnection?.connection.server as string,
                database: sharedData.userConnection?.connection.database as string
            }
        };

        return res.json({
            user,
            token
        });

    } catch (error: any) {
        console.log({ error })
        return res.status(500).send(error.message);
    }
};


interface Req extends Request {
    id?: string
}

const renew = async (req: Req, res: Response) => {

    const user = sharedData?.userConnection?.connection;

    try {
        if (!user) return;
        const token = await generateJWTDB({servidor: user.server, database: user.database as string });

        res.json({
            user,
            token
        });
    } catch (error: any) {
        res.status(500).send(error.message);
        console.log({ error })
    }
}



// Utils

const getUserByEmail = async (mainPool: any, email: string) => {
    const query_DB = querys.auth;
    const result = await mainPool.request().input('email', email).query(query_DB);
    return result?.recordset[0];
};

/* const getUserSubscriptionDueDate = async (mainPool: any, clientId: number) => {
    const query_CLIENTES = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[CLIENTES] WHERE Id_Cliente = @clienteId`;
    const resultCliente = await mainPool.request().input('clienteId', clientId).query(query_CLIENTES);
    return resultCliente?.recordset[0].Vigencia;
};

const isSubscriptionExpired = (dueDate: string) => {
    const today = moment().startOf('day');
    const isExpired = moment(dueDate).startOf('day').isBefore(today);
    return isExpired;
}; */


export {
    loginDB,
    login,
    renew
}