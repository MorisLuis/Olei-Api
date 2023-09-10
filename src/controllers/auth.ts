import { Request, Response } from 'express';
import { closeDbConnection, dbConnection } from '../database';
import moment from 'moment';
import { generateJWT } from '../helpers/generate-jwt';
import { sharedData } from '../app';


const login = async (req: Request, res: Response) => {

    try {
        const mainPool = await dbConnection();

        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }

        const { email, password } = req.body;

        // Search for the user in the database using their email.
        const query_DB = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOSOOL] WHERE Id_UsuarioOOL = @email`;
        const result = await mainPool.request().input('email', email).query(query_DB);
        const user = result?.recordset[0];

        // Update sharedData.currentUser for global access.
        sharedData.currentUser = { user };

        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }

        if (user.PasswordOOL.trim() !== password) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Get the user's subscription expiration date.
        const query_CLIENTES = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[CLIENTES] WHERE Id_Cliente = @clienteId`;
        const resultCliente = await mainPool.request().input('clienteId', user.Id_ClienteDBCLIENTES).query(query_CLIENTES);
        const dueDate = resultCliente?.recordset[0].Vigencia;

        // Compare the expiration date with today.
        const today = moment().startOf('day');
        const isExpired = moment(dueDate).startOf('day').isBefore(today);

        if (isExpired) {
            return res.status(401).json({ error: 'Subscription has expired' });
        }

        // Generate a JWT token for the user.
        const token = await generateJWT({ id: user.Id_UsuarioOOL, rol: user.TipoUsuario });

        // Get user database connection details.
        const otherDBServer = user.ServidorSQL.trim();
        const otherDBDatabase = user.BaseSQL.trim();

        // Close the connection to the main database.
        await mainPool.close();

        let otherPool;

        // Connect to the user's database.
        try {
            otherPool = await dbConnection(otherDBServer, otherDBDatabase);
        } catch (error: any) {
            return res.status(500).send(error.message);
        }

        return res.json({
            otherDBServer,
            otherDBDatabase,
            user,
            token,
            otherPool
        });

    } catch (error: any) {
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
    const email = req.id?.trim() || ''

    const user = sharedData?.currentUser?.user;

    try {
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

export {
    login,
    logout,
    renew
}