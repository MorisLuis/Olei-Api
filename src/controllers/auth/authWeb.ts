import { Request, Response } from 'express';

import { closeDbConnection, dbConnection, querys } from '../../database';
import { generateWebJWT } from '../../helpers/generate-jwt';
import config from '../../config';
import moment from 'moment';
import UserInterface from '../../interface/user';
import { getUserDataWeb, setClientData, setUserDataWeb } from '../../Storage/storageWeb';

const loginWeb = async (req: Request, res: Response) => {

    try {
        // STEP 1 - LOGIN
        const mainPool = await dbConnection(config.dbServer, config.dbDatabase);

        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }

        // Search for the user in the database using their email.
        const { email, password } = req.body;

        if (email === "" || password === "") {
            return res.status(400).json({ error: 'Necesario escribir correo y contraseña' });
        }

        const user = await getUserByEmailWeb(mainPool, email);


        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrado' });
        }

        if (user.PasswordOOL.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Get user database connection details.
        const otherDBServer = user.ServidorSQL.trim();
        const otherDBDatabase = user.BaseSQL.trim();



        await mainPool.close();

        // STEP 2 - CONNECT THE COMPANY DATABASE
        // Connect to the user's database.
        const otherDBConnection = await connectToUserDatabase(user);

        const UserData = {
            Id_UsuarioOOL: user.Id_UsuarioOOL,
            TipoUsuario: user.TipoUsuario,
            PrivilegioTipoCliente: user.PrivilegioTipoCliente,
            Id_Almacen: user.Id_Almacen,
            SwImagenes: user.SwImagenes,
            SwSinStock: user.SwSinStock,
            SwsinPrecio: user.SwsinPrecio,
            TipoDocOO: user.TipoDocOO,
            IdOLEI: user.IdOLEI,
            Company: user.Company,

            Id_ListPre: otherDBConnection.currentUser.user.Id_ListPre
        }


        setUserDataWeb(user.BaseSQL.trim(), UserData)
        const currentUser = getUserDataWeb(user.BaseSQL.trim());

        return res.json({
            otherDBServer,
            otherDBDatabase,
            user: currentUser,
            token: otherDBConnection.token
        });

    } catch (error: any) {
        console.log({ error })
        return res.status(500).json({ error: error.message || 'Unexpected error' });
    } finally {
        await closeDbConnection()
    }
};

const renewWeb = async (req: Request, res: Response) => {


    const serverWeb = req.serverweb;
    const baseWeb = req.baseweb;
    const id = req.id;
    const rol = req.rol;
    const clientid = req.clientid

    try {

        if (!id && !rol) {
            return res.status(401).json({ message: 'Id and rol are neccessary' });
        };

        if (!serverWeb && !baseWeb) {
            return res.status(401).json({ message: 'Server and base data is neccessary' });
        };

        let token
        if (clientid) {
            token = await generateWebJWT({ id, rol, serverweb: serverWeb, baseweb: baseWeb, clientid });
        } else {
            token = await generateWebJWT({ id, rol, serverweb: serverWeb, baseweb: baseWeb });
        }

        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
        };

        const user = await getUserDataWeb(baseWeb)

        res.json({
            user,
            token
        });
    } catch (error: any) {
        console.log({ errorRW: error })
        res.status(500).send(error.message);
    } finally {
        await closeDbConnection()
    }
}


const logout = async (req: Request, res: Response) => {

    try {

        await closeDbConnection()

        res.json({
            ok: false,
        })

    } catch (error) {
        console.log({ error })
    }  finally {
        await closeDbConnection()
    }
}



//Utils
const getUserByEmailWeb = async (mainPool: any, email: string) => {
    const query_DB = querys.authWeb;
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


        const TypeOfMovementsResult = await otherPool.request().query(querys.getTypeOfMovementInitial)
        const TypeOfMovements = TypeOfMovementsResult.recordset[0]

        const UserData = {
            user: {
                ...user,
                Id_ListPre,
                Nombre,
                Id_TipoMovInv: {
                    Id_TipoMovInv: TypeOfMovements.Id_TipoMovInv,
                    Accion: TypeOfMovements.Accion,
                    Descripcion: TypeOfMovements.Descripcion,
                    Id_AlmDest: TypeOfMovements.Id_AlmDest
                }
            }
        };

        const Id_Cliente = user?.Id_Cliente ? user.Id_Cliente : 0

        const client = {
            Id_Almacen: user.Id_Almacen,
            Id_Cliente: Id_Cliente,
            Id_ListPre,
            IsEmploye: false
        };

        setClientData(`${user.BaseSQL.trim()}_${Id_Cliente}`, client)

        const token = await generateWebJWT({
            id: user.Id_UsuarioOOL.trim(),
            rol: user.TipoUsuario,
            serverweb: user.ServidorSQL.trim(),
            baseweb: user.BaseSQL.trim(),
            clientid: Id_Cliente
        });


        return {
            server: user.ServidorSQL.trim(),
            database: user.BaseSQL.trim(),
            pool: otherPool,
            currentUser: UserData,
            token
        }

    } catch (error) {
        console.error("Error en connectToUserDatabase:", error);
        throw error;
    }
};


export {
    loginWeb,
    renewWeb,
    logout
}