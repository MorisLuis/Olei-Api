import { Request, Response } from 'express';

import { closeDbConnection, dbConnection, querys } from '../database';
import moment from 'moment';
import { generateJWT } from '../helpers/generate-jwt';
import { sharedData } from '../app';
import config from '../config';
import UserInterface from '../interface/user';

const login = async (req: Request, res: Response) => {

    try {
        // STEP 1 - LOGIN
        const mainPool = await dbConnection(config.dbServer, config.dbDatabase);

        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }


        // Search for the user in the database using their email.
        const { email, password } = req.body;
        const user = await getUserByEmail(mainPool, email);

        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrada' });
        }

        if (user.PasswordOOL.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Get the user's subscription expiration date.
        const dueDate = await getUserSubscriptionDueDate(mainPool, user.Id_ClienteDBCLIENTES);
        if (isSubscriptionExpired(dueDate)) {
            return res.status(401).json({ error: 'Subscripción ha expirado' });
        }
        const token = await generateJWT({ id: user.Id_UsuarioOOL, rol: user.TipoUsuario });


        // Get user database connection details.
        const otherDBServer = user.ServidorSQL.trim();
        const otherDBDatabase = user.BaseSQL.trim();


        // Update sharedData.userConnection for global access.
        sharedData.userConnection = {
            connection: {
                user: config.dbUser,
                password: config.dbPassword,
                server: otherDBServer,
                database: otherDBDatabase
            }
        };
        await mainPool.close();

        // STEP 2 - CONNECT THE COMPANY DATABASE
        // Connect to the user's database.
        const otherDBConnection = await connectToUserDatabase(user);

        return res.json({
            otherDBServer,
            otherDBDatabase,
            user: otherDBConnection.currentUser,
            token
        });

    } catch (error: any) {
        console.log({ error })
        return res.status(500).send(error.message);
    }
};

const logout = async (req: Request, res: Response) => {

    try {

        await closeDbConnection()

        const server = "babs4kdofr.database.windows.net";
        const database = "OLEIDB1_CLIENTES";
        const pool = await dbConnection(server, database);

        const connectionStatus = pool?.connected ? 'Connected' : 'Not Connected';

        res.json({
            status: connectionStatus,
            pool
        })

    } catch (error) {
        console.log({ error })
    }
}

interface Req extends Request {
    id?: string
}

const renew = async (req: Req, res: Response) => {

    const user = sharedData?.currentUser?.user;

    try {
        if (!user) return;
        const token = await generateJWT({ id: user.Id_UsuarioOOL, rol: user.TipoUsuario });
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

const getUserSubscriptionDueDate = async (mainPool: any, clientId: number) => {
    const query_CLIENTES = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[CLIENTES] WHERE Id_Cliente = @clienteId`;
    const resultCliente = await mainPool.request().input('clienteId', clientId).query(query_CLIENTES);
    return resultCliente?.recordset[0].Vigencia;
};

const isSubscriptionExpired = (dueDate: string) => {
    const today = moment().startOf('day');
    const isExpired = moment(dueDate).startOf('day').isBefore(today);
    return isExpired;
};

const connectToUserDatabase = async (user: UserInterface) => {
    try {
        const otherPool = await dbConnection(user.ServidorSQL.trim(), user.BaseSQL.trim());

        const query_DB = querys.authCompany;
        const idListPreResult = await otherPool.request()
            .input('Id_Cliente', user.Id_Cliente ? user.Id_Cliente : 1)
            .input("IdOLEI", user.IdOLEI)
            .query(query_DB);

        const Id_ListPre = idListPreResult?.recordset[0]?.Id_ListPre;
        const Nombre = idListPreResult?.recordset[0]?.Nombre;

        sharedData.currentUser = {
            user: {
                ...user,
                Id_ListPre,
                Nombre
            }
        };

        sharedData.currentClient = {
            client: {
                Id_Almacen: user.Id_Almacen,
                Id_Cliente: user.Id_Cliente,
                Id_ListPre
            }
        };

        return {
            server: user.ServidorSQL.trim(),
            database: user.BaseSQL.trim(),
            pool: otherPool,
            currentUser: sharedData.currentUser.user
        };
    } catch (error) {
        // Aquí puedes manejar el error, ya sea registrándolo, lanzando una excepción diferente o realizando alguna otra acción.
        console.error("Error en connectToUserDatabase:", error);
        throw error; // Puedes relanzar el error si quieres que la función que llamó a esta también lo maneje.
    }
};

export {
    login,
    logout,
    renew
}