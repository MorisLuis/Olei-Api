import moment from 'moment-timezone';

export const currentTime = () => {
    const tz = 'America/Monterrey'; // Zona horaria deseada
    const format = "YYYY-MM-DDTHH:mm:ss.sssZ"; // Formato ISO 8601

    // Obtener la fecha y hora actual en la zona horaria deseada y formatearla
    const currentDateTime = moment().tz(tz).format(format);

    return currentDateTime;
}
