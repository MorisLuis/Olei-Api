import jwt from 'jsonwebtoken';


interface generateJWTDBProps {
    IdUsuarioOLEI?: string
}


const generateJWTDB = ({ IdUsuarioOLEI }: generateJWTDBProps) => {
    return new Promise((resolve, reject) => {
        const payload = { IdUsuarioOLEI }
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: '31536000s' // 1 year
        }, (error, token) => {
            if (error) {
                reject('No se pudo generar el token')
            }
            resolve(token)
        });
    })
}


interface generateJWTProps {
    Id_mobile: string
}

const generateJWT = ({ Id_mobile }: generateJWTProps) => {
    return new Promise((resolve, reject) => {
        const payload = { Id_mobile }
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: process.env.JWT_EXPIRATION
        }, (error, token) => {
            if (error) {
                reject('No se pudo generar el token')
            }
            resolve(token)
        })
    })
}

interface generateJWTPropsWeb {
    Id: string,
    sessionRedis: string
}


const generateWebJWT = ({ Id, sessionRedis }: generateJWTPropsWeb) => {
    return new Promise((resolve, reject) => {
        const payload = { Id, sessionRedis }
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: process.env.JWT_EXPIRATION
        }, (error, token) => {
            if (error) {
                reject('No se pudo generar el token')
            }

            resolve(token)
        })
    })
}

export {
    generateJWT,
    generateJWTDB,
    generateWebJWT
}

