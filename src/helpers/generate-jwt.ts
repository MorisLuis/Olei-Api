import jwt from 'jsonwebtoken';


interface generateJWTDBProps {
    IdUsuarioOLEI?: string
}


const generateJWTDB = ({ IdUsuarioOLEI }: generateJWTDBProps): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = { IdUsuarioOLEI };

        jwt.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: '31536000s' // 1 year
        }, (error, token) => {
            if (error) {
                reject(new Error('No se pudo generar el token')); // Usa un Error en lugar de un string
                return;
            }
            resolve(token as string);
        });
    });
};



interface generateJWTProps {
    Id_mobile: string
}

const generateJWT = ({ Id_mobile }: generateJWTProps) : Promise<string>  => {
    return new Promise((resolve, reject) => {
        const payload = { Id_mobile }
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: process.env.JWT_EXPIRATION
        }, (error, token) => {
            if (error) {
                reject('No se pudo generar el token')
            }
            resolve(token as string)
        })
    })
}

interface generateJWTPropsWeb {
    Id: string,
    sessionRedis: string
}


const generateWebJWT = ({ Id, sessionRedis }: generateJWTPropsWeb): Promise<string>  => {
    return new Promise((resolve, reject) => {
        const payload = { Id, sessionRedis }
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: process.env.JWT_EXPIRATION
        }, (error, token) => {
            if (error) {
                reject('No se pudo generar el token')
            }

            resolve(token as string)
        })
    })
}

export {
    generateJWT,
    generateJWTDB,
    generateWebJWT
}

