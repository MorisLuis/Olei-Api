import jwt from 'jsonwebtoken';

const generateJWT = (id: string, rol: Number) => {
    return new Promise((resolve, reject) => {
        const payload = { id, rol }
        console.log(process.env.SECRETORPRIVATEKE)
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



export {
    generateJWT
}

