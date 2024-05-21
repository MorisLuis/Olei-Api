import jwt from 'jsonwebtoken';

interface generateJWTProps {
    id: string,
    rol: number
}

const generateJWT = ({ id, rol }: generateJWTProps) => {
    return new Promise((resolve, reject) => {
        const payload = { id, rol }
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: '8h'
        }, (error, token) => {
            if (error) {
                console.log(error)
                reject('No se pudo generar el token')
            }

            resolve(token)
        })
    })
}

interface generateJWTDBProps {
    IdUsuarioOLEI: string,
    PasswordOLEI: string
}


const generateJWTDB = ({ IdUsuarioOLEI, PasswordOLEI }: generateJWTDBProps) => {
    return new Promise((resolve, reject) => {
        const payload = { IdUsuarioOLEI, PasswordOLEI }
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: '1y'
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
    generateJWTDB
}

