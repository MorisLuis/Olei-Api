import { Request, Response } from 'express'
import { closeDbConnection, dbConnection } from '../database';
import moment from 'moment';
import { generateJWT } from '../helpers/generate-jwt';
import bcrypt from "bcrypt";

const login = async (req: Request, res: Response) => {
    
    try {
        const mainPool = await dbConnection();
        if (!mainPool) {
            res.status(500).json({ error: 'Error en la conexión a la base de datos principal' });
            return;
        }

        const { email, password } = req.body;

        // Buscar el usuario en la base de datos usando el correo electrónico
        const query_DB = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOSOOL] WHERE Id_UsuarioOOL = '${email}'`;
        const result = await mainPool.request().input('email', email).query(query_DB);

        const user = result?.recordset[0];

        if (!user) {
            res.status(404).json({ error: 'Correo no encontrado' });
            return;
        }

        if (user.PasswordOOL.trim() !== password) {
            res.status(401).json({ error: 'Contraseña incorrecta' });
            return;
        }


        /// Obtener la fecha de vencimiento de la suscripción del usuario
        const query_CLIENTES = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[CLIENTES] WHERE Id_Cliente = @clienteId`;
        const resultCliente = await mainPool.request().input('clienteId', user.Id_ClienteDBCLIENTES).query(query_CLIENTES);
        const dueDate = resultCliente?.recordset[0].Vigencia;

        // Comparar la fecha de vencimiento con el día de hoy
        const today = moment().startOf('day');
        const isExpired = moment(dueDate).startOf('day').isBefore(today);

        if (isExpired) {
            res.status(401).json({ error: 'La suscripción ha expirado' });
            return;
        }

        // Generar un token JWT para el usuario
        const token = await generateJWT(user.Id_UsuarioOOL, user.TipoUsuario);


        // Realizar la conexión a otra base de datos
        const otherDBServer = user.ServidorSQL.trim();
        const otherDBDatabase = user.BaseSQL.trim();

        await mainPool.close()

        let otherPool;

        try {
            otherPool = await dbConnection(otherDBServer, otherDBDatabase);
        } catch (error:any) {
            res.status(500).send(error.message);
            console.log({error})
        }


        res.json({
            otherDBServer,
            otherDBDatabase,
            mainPool,
            user,
            token,
            otherPool
        });


    } catch (error: any) {
        res.status(500).send(error.message);
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

    try {
        closeDbConnection()
        const pool = await dbConnection();
        const query_DB = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOSOOL] WHERE Id_UsuarioOOL = '${email}'`;
        const result = await pool?.request().query(query_DB);
        const user = result?.recordset[0];

        // Generar un token JWT para el usuario
        const token = await generateJWT(user.Id_UsuarioOOL, user.TipoUsuario);

        // Realizar la conexión a otra base de datos
        const otherDBServer = user.ServidorSQL.trim();
        const otherDBDatabase = user.BaseSQL.trim();

        await pool?.close()

        const otherPool = await dbConnection(otherDBServer, otherDBDatabase);

        res.json({
            user,
            token,
            otherPool
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