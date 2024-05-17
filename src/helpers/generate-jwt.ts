import jwt from 'jsonwebtoken';

interface generateJWTProps {
    id: string,
    rol: number
}

const generateJWT = ({ id, rol }: generateJWTProps) => {
    return new Promise((resolve, reject) => {
        const payload = { id, rol}
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
    servidor: string,
    database: string
}


const generateJWTDB = ({ servidor, database }: generateJWTDBProps) => {
    return new Promise((resolve, reject) => {
        const payload = { servidor, database}
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

