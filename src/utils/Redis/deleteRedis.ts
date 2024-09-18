import { redisClient } from "../../models/server";


interface handleDeleteRedisSessionInterface {
    sessionId: string;
}


export const handleDeleteRedisSession = async ({ sessionId } : handleDeleteRedisSessionInterface )  => {

    await redisClient?.del(`sess:${sessionId}`, (err, response) => {
        if (err) {
            console.error('Error al eliminar la sesión:', err);
        } else {
            if (response === 1) {
                console.log('Sesión eliminada exitosamente');
            } else {
                console.log('Sesión no encontrada en Redis');
            }
        }
    });

}