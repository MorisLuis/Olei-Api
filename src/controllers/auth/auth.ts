import { Request, Response } from 'express';

import { dbConnection, querys } from '../../database';
import { generateJWT, generateJWTDB } from '../../helpers/generate-jwt';
import { sharedData } from '../..';
import config from '../../config';
import moment from 'moment';

const loginDB = async (req: Request, res: Response) => {

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

        sharedData.currentUser = {
            user: {
                ...sharedData.currentUser?.user,
                Nombre: cleanResult.Nombre,
                Id_ListPre: cleanResult.Id_ListPre,
                Id_Almacen: cleanResult.Id_Almacen,
                Id_UsuarioOOL: cleanResult.IdUsuarioOLEI,
                PasswordOOL: cleanResult.PasswordOLEI,
                ServidorSQL: cleanResult.ServidorSQL,
                BaseSQL: cleanResult.BaseSQL,
                TipoUsuario: 1,
                PrivilegioTipoCliente: 1,
                PrecioIncIVA: 1,
                SwImagenes: cleanResult.SwImagenes === true ? 1 : 0,
                SwSinStock: cleanResult.SwSinStock === true ? 1 : 0,
                SwsinPrecio: cleanResult.SwsinPrecio === true ? 1 : 0,
                TipoDocOO: cleanResult.TipoDocOO,
                IdOLEI: cleanResult.IdOLEI,
                Vigencia: cleanResult.Vigencia,
                RazonSocial: cleanResult.RazonSocial
            }
        };

        sharedData.userConnection = {
            connection: {
                user: config.dbUser,
                password: config.dbPassword,
                server: cleanResult.ServidorSQL.trim(),
                database: cleanResult.BaseSQL.trim()
            }
        };

        const tokenDB = await generateJWTDB({ IdUsuarioOLEI, PasswordOLEI });

        return res.json({
            tokenDB,
            user: sharedData.currentUser.user,
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

const login = async (req: Request, res: Response) => {

    // STEP 1 - LOGIN
    const mainPool = await dbConnection(sharedData.userConnection?.connection.server, sharedData.userConnection?.connection.database);

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

        if (!sharedData.currentUser?.user.Vigencia) return;

        // Get the user's subscription expiration date.
        const dueDate = await isSubscriptionExpired(sharedData.currentUser?.user.Vigencia);
        if (dueDate) {
            return res.status(401).json({ error: 'Subscripción ha expirado' });
        }

        // Update sharedData.userConnection for global access.
        sharedData.userConnection = {
            connection: {
                user: config.dbUser,
                password: config.dbPassword,
                server: sharedData.userConnection?.connection.server as string,
                database: sharedData.userConnection?.connection.database as string
            }
        };

        const TypeOfMovementsResult = await mainPool.request().query(querys.getTypeOfMovementInitial)
        const TypeOfMovements = TypeOfMovementsResult.recordset[0]

        sharedData.currentUser = {
            user: {
                ...sharedData.currentUser.user,
                Id_TipoMovInv: {
                    Id_TipoMovInv: TypeOfMovements.Id_TipoMovInv,
                    Accion: TypeOfMovements.Accion,
                    Descripcion: TypeOfMovements.Descripcion,
                    Id_AlmDest: TypeOfMovements.Id_AlmDest
                }
            }
        };

        const token = await generateJWT({ id: user.EMail, rol: user.Id_Perfil });


        return res.json({
            user,
            token
        });

    } catch (error: any) {
        console.log({ error })
        return res.status(500).json({ error: error.message || 'Unexpected error' });
    } finally {
        mainPool.close()
    }

};


interface Req extends Request {
    id?: string
}

const renew = async (req: Req, res: Response) => {

    const userDB = sharedData?.userConnection?.connection;
    const user = sharedData.currentUser?.user;

    try {
        if (!userDB) {
            return res.status(401).json({ message: 'UserDB not authenticated' });
        };

        const token = await generateJWTDB({ IdUsuarioOLEI: userDB.server, PasswordOLEI: userDB.database as string });

        res.json({
            userDB,
            user,
            token
        });

    } catch (error: any) {
        res.status(500).send(error.message);
        console.log({ error })
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
    renew
}