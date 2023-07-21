import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken';

interface Req extends Request {
    id?: string
}

const validateJWT = async (req: Req, res: Response, next: NextFunction) => {

    const token = req.header('x-token');


    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'Access denied. Token missing or invalid.'
        })
    }

    try {
        const payload = jwt.verify(token, process.env.SECRETORPRIVATEKEY || '') as any
        req.id = payload.id
    } catch (error) {
        return res.status(401).json({
            ok: false,
            message: 'Invalid token.'
        })
    }

    next()

}




export {
    validateJWT
}