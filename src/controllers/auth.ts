import { Request, Response } from 'express';
import { closeDbConnection, dbConnection } from '../database';
import moment from 'moment';
import { generateJWT } from '../helpers/generate-jwt';
import { sharedData } from '../app';
import config from '../config';

const login = async (req: Request, res: Response) => {

    try {
        const mainPool = await dbConnection(config.dbServer, config.dbDatabase);

        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }

        const { email, password } = req.body;

        // Search for the user in the database using their email.
        const query_DB = `
        SELECT U.*, 
        TRIM(UC.Nombre) AS Company
        FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOSOOL] U
        JOIN [OLEIDB1_CLIENTES].[dbo].[CLIENTES] UC on U.Id_ClienteDBCLIENTES = UC.Id_Cliente
        WHERE U.Id_UsuarioOOL =  @email
        `;

        const result = await mainPool.request().input('email', email).query(query_DB);
        const user = result?.recordset[0];

        console.log({user})

        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrada' });
        }

        if (user.PasswordOOL.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Get the user's subscription expiration date.
        const query_CLIENTES = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[CLIENTES] WHERE Id_Cliente = @clienteId`;
        const resultCliente = await mainPool.request().input('clienteId', user.Id_ClienteDBCLIENTES).query(query_CLIENTES);
        const dueDate = resultCliente?.recordset[0].Vigencia;

        // Compare the expiration date with today.
        const today = moment().startOf('day');
        const isExpired = moment(dueDate).startOf('day').isBefore(today);

        if (isExpired) {
            return res.status(401).json({ error: 'Subscripción ha expirado' });
        }

        // Generate a JWT token for the user.
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

        // Close the connection to the main database.
        await mainPool.close();

        let otherPool;

        // Connect to the user's database.
        try {
            const otherPool = await dbConnection(otherDBServer, otherDBDatabase)
            const otherPoolDatabase = (otherPool as any).config.database


            const query_DB = `
                SELECT C.Id_ListPre,  C.Nombre, CS.PrecioIncIVA
                FROM [${otherPoolDatabase}].[dbo].[CLIENTES] C
                JOIN [${otherPoolDatabase}].[dbo].[CONFIGSIST] CS ON C.IdOLEI = 1
                WHERE Id_Cliente = ${user.Id_Cliente ? user.Id_Cliente : 1}
            `;

            const idListPreResult = await otherPool.query(query_DB);
            const Id_ListPre = idListPreResult.recordset[0].Id_ListPre;
            const Nombre = idListPreResult.recordset[0].Nombre

            console.log({user})


            // Update sharedData.currentUser for global access.
            sharedData.currentUser = {
                user: {
                    ...user,
                    Id_ListPre,
                    Nombre
                }
            };

            console.log('user', sharedData.currentUser)

            // Update sharedData.currentClient for global access.
            sharedData.currentClient = {
                client: {
                    Id_Almacen: user.Id_Almacen,
                    Id_Cliente: user.Id_Cliente,
                    Id_ListPre
                }
            };

        } catch (error: any) {
            return res.status(500).send(error.message);
        }

        return res.json({
            otherDBServer,
            otherDBDatabase,
            user: sharedData.currentUser.user,
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

export {
    login,
    logout,
    renew
}