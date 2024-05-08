export const currentTime = () => {
    // Obtener la fecha actual
    const now = new Date();
    // Obtener el desplazamiento horario en minutos
    const offset = now.getTimezoneOffset();
    // Calcular el desplazamiento en milisegundos
    const offsetMilliseconds = offset * 60 * 1000;
    // Ajustar la fecha actual restando el desplazamiento
    const mexicoNow = new Date(now.getTime() - offsetMilliseconds);
    return mexicoNow;
}
