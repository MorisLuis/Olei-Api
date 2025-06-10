import type { NextFunction, Request, Response } from 'express';
import type { UserWebSessionInterface } from '../../interface/user';
import { loginWebService } from '../../services/authServices';
import { generateAccessTokenWeb, generateRefreshTokenWeb } from '../../helpers/generate-jwt';
import { v4 } from 'uuid';
import { generateRedisSessionWeb, handleDeleteRedisSession } from '../../helpers/generate-redis';

const loginWeb = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { email, password } = req.body;
        const user = await loginWebService(email, password);

        const datosDelUsuario: UserWebSessionInterface = {
            ...user,
            from: 'web'
        };

        // Generar un ID de sesión único
        const sessionId = v4();
        console.log({sessionId})

        const token = generateAccessTokenWeb(sessionId)
        const refreshToken = generateRefreshTokenWeb(sessionId);

        // Guardar la sesión en Redis con expiración (1 hora)
        await generateRedisSessionWeb(sessionId, datosDelUsuario)

        // Enviar el refreshToken en cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        return res.json({
            user: datosDelUsuario,
            token
        });

    } catch (error) {
        return next(error)
    }
};

const renewWeb = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        // Get session from REDIS.
        const userSession = req.sessionWeb;
        const sessionId = req.sessionId;
        const refreshToken = req.cookies.refreshToken;
        console.log({refreshToken})

        if (!refreshToken) {
            return res.status(401).json({ message: "No hay refresh token" });
        }

        // Guardar la sesión en Redis con expiración (1 hora)
        await generateRedisSessionWeb(sessionId, userSession)

        // Generar el token JWT que incluye el sessionId
        const newToken = generateAccessTokenWeb(sessionId)
        const newRefreshToken = generateRefreshTokenWeb(sessionId);

        // Enviar el refreshToken en cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        return res.json({
            user: userSession,
            token: newToken
        });

    } catch (error) {
        return next(error)
    }
};

const logout = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const sessionId = req.sessionId;
        await handleDeleteRedisSession(sessionId);
        return res.json({ ok: true })
    } catch (error) {
        return next(error)
    }
}

export {
    loginWeb,
    renewWeb,
    logout
}