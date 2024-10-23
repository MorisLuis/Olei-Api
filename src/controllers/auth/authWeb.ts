import { NextFunction, Request, Response } from 'express';
import { closeDbConnection, querys } from '../../database';
import { generateWebJWT } from '../../helpers/generate-jwt';
import moment from 'moment';
import { UserWebSessionInterface } from '../../interface/user';
import { handleGetWebSession } from '../../utils/Redis/getSession';
import { handleDeleteRedisSession } from '../../utils/Redis/deleteRedis';
import BadRequestError from '../../errors/BadRequestError';
import { ConnectionPool } from 'mssql';
import { loginWebService } from '../../services/authServices';

const loginWeb = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { email, password } = req.body;
        const { SwsinPrecio, TipoDocOO, ServidorSQL, BaseSQL, Vigencia, Id_ListPre, UsuarioSQL, ...user } = await loginWebService(email, password);
        const { Id_UsuarioOOL, Nombre, Id_Cliente, SwImagenes, SwSinStock, TipoUsuario, Id_Almacen } = user;

        const datosDelUsuario: UserWebSessionInterface = {
            Id: Id_UsuarioOOL.trim(),
            Nombre: Nombre.trim(),
            Serverweb: ServidorSQL.trim(),
            Baseweb: BaseSQL.trim(),
            Id_Cliente: Id_Cliente || 0,
            Id_ListPre,
            Vigencia: Vigencia,
            SwImagenes: SwImagenes,
            SwSinStock: SwSinStock,
            SwsinPrecio,
            TipoDocOO,
            TipoUsuario: TipoUsuario,
            Id_Almacen: Id_Almacen,
            Id_Usuario: UsuarioSQL,
            PrecioIncIVA: 0,
            from: 'web'
        };

        (req.session as any).userWeb = datosDelUsuario;

        // Generar token JWT
        const token = await generateWebJWT({ Id: user.Id_UsuarioOOL.trim(), sessionRedis: req.sessionID });

        return res.json({
            user: datosDelUsuario,
            token
        });

    } catch (error) {
        next(error)
    }
};

const renewWeb = async (req: Request, res: Response, next: NextFunction) => {

    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
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
        token = await generateWebJWT({ Id, sessionRedis: req.sessionID });

        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
        };

        res.json({
            user: userFR,
            token
        });
    } catch (error) {
        next(error)
    }
}

const logout = async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.sessionRedis;

    if (!sessionId) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    try {
        await closeDbConnection()
        await handleDeleteRedisSession({ sessionId });
        res.json({ ok: true })

    } catch (error) {
        next(error)
    }
}

export {
    loginWeb,
    renewWeb,
    logout
}