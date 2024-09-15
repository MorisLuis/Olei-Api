import { Request, Response } from 'express';
import { closeDbConnection, dbConnection, querys } from '../../database';
import { generateWebJWT } from '../../helpers/generate-jwt';
import config from '../../config';
import moment from 'moment';
import { UserWebSessionInterface } from '../../interface/user';
import { handleGetWebSession } from '../../utils/Redis/getSession';
import { handleDeleteRedisSession } from '../../utils/Redis/deleteRedis';

const loginWeb = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (email === "" || password === "") {
        return res.status(400).json({ error: 'Necesario escribir correo y contraseña' });
    }

    try {
        const mainPool = await dbConnection(config.dbServer, config.dbDatabase);

        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }

        const { SwsinPrecio, TipoDocOO, ServidorSQL, BaseSQL, Vigencia, Id_ListPre, UsuarioSQL, ...user } = await getUserByEmailWeb(mainPool, email);
        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrado' });
        }

        if (user.PasswordOOL.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const isExpired = await isSubscriptionExpired(Vigencia);
        if (isExpired) {
            return res.status(401).json({ error: 'Cuenta de usuario vencida.' });
        }

        const datosDelUsuario: UserWebSessionInterface = {
            Id: user.Id_UsuarioOOL.trim(),
            Nombre: user.Nombre.trim(),
            Serverweb: ServidorSQL.trim(),
            Baseweb: BaseSQL.trim(),
            Id_Cliente: user.Id_Cliente || 0,
            Id_ListPre,
            Vigencia: Vigencia,
            SwImagenes: user.SwImagenes,
            SwSinStock: user.SwSinStock,
            SwsinPrecio,
            TipoDocOO,
            TipoUsuario: user.TipoUsuario,
            Id_Almacen: user.Id_Almacen,
            Id_Usuario: UsuarioSQL,
            PrecioIncIVA: 0
        };

        const sessionId1 = req.sessionID;
        console.log({sessionId1});

        (req.session as any).user = datosDelUsuario;
        const sessionId2 = req.sessionID;
        console.log({sessionId2})

        // Generar token JWT
        const token = await generateWebJWT({ Id: user.Id_UsuarioOOL.trim() });

        return res.json({
            user: {
                ...user,
                Id_ListPre
            },
            token
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ error: error.message || 'Unexpected error' });
    } finally {
        await closeDbConnection();
    }
};



const renewWeb = async (req: Request, res: Response) => {

    console.log("renewweb")
    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { Id, TipoUsuario, Serverweb, Baseweb } = userFR;

    try {

        if (!Id && !TipoUsuario) {
            return res.status(401).json({ message: 'Id and rol are neccessary' });
        };

        if (!Serverweb && !Baseweb) {
            return res.status(401).json({ message: 'Server and base data is neccessary' });
        };

        let token
        token = await generateWebJWT({ Id });

        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
        };

        res.json({
            user: userFR,
            token
        });
    } catch (error: any) {
        console.log({ errorRW: error })
        res.status(500).send(error.message);
    }
}

const logout = async (req: Request, res: Response) => {

    const sessionId = req.sessionID;

    if (!sessionId) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    try {

        await handleDeleteRedisSession({ sessionId });
        res.json({ ok: true })

    } catch (error) {
        console.log({ error })
    } finally {
        await closeDbConnection()
    }
}


//Utils
const getUserByEmailWeb = async (mainPool: any, email: string) => {
    const query_DB = querys.authWeb;
    const result = await mainPool.request().input('email', email).query(query_DB);
    return result?.recordset[0];
};

const isSubscriptionExpired = (dueDate: string) => {
    const today = moment().startOf('day');
    const isExpired = moment(dueDate).startOf('day').isBefore(today);
    return isExpired;
};

export {
    loginWeb,
    renewWeb,
    logout
}