import jwt from 'jsonwebtoken';

interface Props {
    id: string,
    rol: number
}

const generateJWT = ({ id, rol }: Props) => {
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



export {
    generateJWT
}

