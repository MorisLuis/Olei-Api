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
                console.log(error)
                reject('No se pudo generar el token')
            }
            resolve(token)
        });
    })
}


interface generateJWTProps {
    id: string
}

const generateJWT = ({ id }: generateJWTProps) => {
    return new Promise((resolve, reject) => {
        const payload = { id }
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: process.env.JWT_EXPIRATION
        }, (error, token) => {
            if (error) {
                console.log(error)
                reject('No se pudo generar el token')
            }
            resolve(token)
        })
    })
}

interface generateJWTPropsWeb {
    Id: string,
    sessionID: string
}


const generateWebJWT = ({ Id, sessionID }: generateJWTPropsWeb) => {
    return new Promise((resolve, reject) => {
        const payload = { Id, sessionID }
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: process.env.JWT_EXPIRATION
        }, (error, token) => {
            if (error) {
                console.log(error)
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

