import { Request, Response } from 'express';
import { dbConnection, querys } from '../../database';
import { generateJWT, generateJWTDB } from '../../helpers/generate-jwt';
import config from '../../config';
import moment from 'moment';
import { getClienteData, setClienteData, setUserData } from '../../Storage/storageApp';

export interface Req extends Request {
    serverclientes: string;
    baseclientes: string;
    id: string;
    rol: number;
}

const loginDB = async (req: Req, res: Response) => {

    // STEP 1 - CONNECT TO OLIEDB1_CLIENTES
    const mainPool = await dbConnection(config.dbServer, config.dbDatabase);

    if (!mainPool) {
        return res.status(500).json({ error: 'Error connecting to the main database' });
    }

    try {
        const { IdUsuarioOLEI, PasswordOLEI } = req.body;

        if (IdUsuarioOLEI.trim() === "" || PasswordOLEI.trim() === "") {
            return res.status(400).json({ error: 'Necesario enviar usuario y contraseña' });
        }

        const query_DB = querys.authDatabase;
        const result = await mainPool.request().input('IdUsuarioOLEI', IdUsuarioOLEI).query(query_DB);
        const cleanResult = result?.recordset[0];

        if (cleanResult.PasswordOLEI.trim() !== PasswordOLEI) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const user = {
            ServidorSQL: cleanResult.ServidorSQL,
            BaseSQL: cleanResult.BaseSQL,
            RazonSocial: cleanResult.RazonSocial
        };

        const tokenDB = await generateJWTDB({
            serverclientes: cleanResult.ServidorSQL.trim(),
            baseclientes: cleanResult.BaseSQL.trim(),
            IdUsuarioOLEI: cleanResult.IdUsuarioOLEI.trim()
        });


        const dataDB = {
            RazonSocial: cleanResult.RazonSocial,
            SwImagenes: cleanResult.SwImagenes,
            Vigencia: cleanResult.Vigencia
        }

        setClienteData(cleanResult.IdUsuarioOLEI.trim(), dataDB)

        return res.json({
            tokenDB,
            user,
            userDB: {
                servidor: cleanResult.ServidorSQL,
                database: cleanResult.BaseSQL
            }
        });

    } catch (error: any) {
        console.log({ error })
        return res.status(500).send(error.message);
    } finally {
        mainPool.close()
    }
}

const login = async (req: Req, res: Response) => {

    const serverclientes = req.serverclientes;
    const baseclientes = req.baseclientes;
    const IdUsuarioOLEI = req.IdUsuarioOLEI;

    // STEP 1 - LOGIN
    const mainPool = await dbConnection(serverclientes, baseclientes);

    if (!mainPool) {
        return res.status(500).json({ error: 'Error connecting to the main database' });
    }

    try {
        // Search for the user in the database using their email.
        const { Id_Usuario, password } = req.body;

        if (Id_Usuario.trim() === "" || password.trim() === "") {
            return res.status(400).json({ error: 'Necesario escribir correo y contraseña' });
        }

        const user = await getUserByEmail(mainPool, Id_Usuario);

        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrado' });
        }

        if (user.Password.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const TypeOfMovementsResult = await mainPool.request().query(querys.getTypeOfMovementInitial)
        const TypeOfMovements = TypeOfMovementsResult.recordset[0]

        const userStorage = {
            Id_Usuario,
            Id_TipoMovInv: {
                Id_TipoMovInv: TypeOfMovements.Id_TipoMovInv,
                Accion: TypeOfMovements.Accion,
                Descripcion: TypeOfMovements.Descripcion,
                Id_AlmDest: TypeOfMovements.Id_AlmDest
            }
        }

        setUserData(`${Id_Usuario}_${baseclientes}`, userStorage);

        const clientData = getClienteData(IdUsuarioOLEI)

        if (!clientData?.Vigencia) {
            return res.status(401).json({ error: 'Necesario tener una cuenta vigente' });
        };

        // Get the user's subscription expiration date.
        const dueDate = await isSubscriptionExpired(clientData?.Vigencia);
        if (dueDate) {
            return res.status(401).json({ error: 'Subscripción ha expirado' });
        }

        const token = await generateJWT({
            id: user.Id_Usuario.trim(),
            rol: user.Id_Perfil,
            server: serverclientes,
            base: baseclientes
        });

        return res.json({
            user: userStorage,
            token
        });

    } catch (error: any) {
        console.log({ error })
        return res.status(500).json({ error: error.message || 'Unexpected error' });
    } finally {
        mainPool.close()
    }
};

const renewDB = async (req: Req, res: Response) => {

    const serverclientes = req.serverclientes;
    const baseclientes = req.baseclientes;
    const IdUsuarioOLEI = req.IdUsuarioOLEI;

    try {
        if (!serverclientes && !baseclientes) {
            return res.status(401).json({ message: 'UserDB not authenticated' });
        };

        const token = await generateJWTDB({
            serverclientes: serverclientes,
            baseclientes: baseclientes,
            IdUsuarioOLEI
        });

        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
        };


        //To get 'Vigencia', SwImagenes and 'RazonSocial'.
        const dataFromDatabase = getClienteData(IdUsuarioOLEI)
        const user = {
            ServidorSQL: serverclientes,
            BaseSQL: baseclientes,
            Vigencia: dataFromDatabase?.Vigencia,
            SwImagenes: dataFromDatabase?.SwImagenes,
            RazonSocial: dataFromDatabase?.RazonSocial
        };

        if (!user) {
            return res.status(401).json({ message: 'User data is neccesary' });
        };

        if (!dataFromDatabase?.Vigencia) {
            return res.status(401).json({ error: 'Necesario tener una cuenta vigente' });
        };

        // Get the user's subscription expiration date.
        const dueDate = await isSubscriptionExpired(dataFromDatabase?.Vigencia);
        if (dueDate) {
            return res.status(401).json({ error: 'Subscripción ha expirado' });
        }

        res.json({
            token,
            user
        });

    } catch (error: any) {
        res.status(500).send(error.message);
        console.log({ error })
    }
}

const renewLogin = async (req: Req, res: Response) => {

    const userId = req.id;
    const userRol = req.rol;
    const server = req.server;
    const base = req.base;

    try {

        if (!userId && !userRol) {
            return res.status(401).json({ message: 'User not authenticated' });
        };

        if (!server && !base) {
            return res.status(401).json({ message: 'Server and base data is neccessary' });
        };

        const token = await generateJWT({
            id: userId,
            rol: userRol,
            server,
            base
        });

        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
        };

        // Get user data.
        const mainPool = await dbConnection(server, base);
        const userDB = await getUserByEmail(mainPool, userId);

        const user = {
            ...userDB,
            ServidorSQL: server,
            BaseSQL: base,
        };

        if (!userDB) {
            return res.status(401).json({ message: 'User data is neccesary' });
        };

        res.json({
            user,
            token
        });

    } catch (error: any) {
        console.log({ error })
        res.status(500).send(error.message);
    }
}

// Utils
const getUserByEmail = async (mainPool: any, Id_Usuario: string) => {
    const query_DB = querys.auth;
    const result = await mainPool.request().input('Id_Usuario', Id_Usuario.trim()).query(query_DB);
    return result?.recordset[0];
};

const isSubscriptionExpired = (dueDate: string) => {
    const today = moment().startOf('day');
    const isExpired = moment(dueDate).startOf('day').isBefore(today);
    return isExpired;
};

export {
    loginDB,
    login,
    renewDB,
    renewLogin
}