import jwt from 'jsonwebtoken';


interface generateJWTDBProps {
    serverclientes?: string,
    baseclientes?: string,
    IdUsuarioOLEI?: string
}


const generateJWTDB = ({ serverclientes, baseclientes, IdUsuarioOLEI }: generateJWTDBProps) => {
    return new Promise((resolve, reject) => {
        const payload = { serverclientes, baseclientes, IdUsuarioOLEI }
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


interface generateJWTProps {
    id: string,
    rol: number,
    server?: string,
    base?: string
}

const generateJWT = ({ id, rol, server, base }: generateJWTProps) => {
    return new Promise((resolve, reject) => {
        const payload = { id, rol, server, base }
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

interface generateJWTProps {
    id: string,
    rol: number,
    serverweb?: string,
    baseweb?: string,
    clientid?: number
}


const generateWebJWT = ({ id, rol, serverweb, baseweb, clientid}: generateJWTProps) => {
    return new Promise((resolve, reject) => {
        const payload = { id, rol, serverweb, baseweb, clientid}
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
    generateJWTDB,
    generateWebJWT
}

