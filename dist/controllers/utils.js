"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUtils = void 0;
const getUtils = async (req, res) => {
    try {
        res.json({
            ok: true
        });
    }
    catch (error) {
        res.status(500).send(error);
    }
};
exports.getUtils = getUtils;
function numeroALetra(num) {
    const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const decenas = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const especiales = ["", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
    const centenas = ["", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];
    function convertirCentenas(num) {
        if (num < 10)
            return unidades[num];
        if (num < 20)
            return especiales[num - 10];
        if (num < 100)
            return decenas[Math.floor(num / 10)] + (num % 10 === 0 ? "" : " y " + unidades[num % 10]);
        if (num === 100)
            return "cien";
        if (num < 1000)
            return centenas[Math.floor(num / 100)] + (num % 100 === 0 ? "" : " " + convertirCentenas(num % 100));
        return "";
    }
    function convertirMiles(num) {
        if (num < 1000)
            return convertirCentenas(num);
        if (num === 1000)
            return "mil";
        if (num < 1000000) {
            const miles = Math.floor(num / 1000);
            const resto = num % 1000;
            return (miles === 1 ? "mil" : convertirCentenas(miles) + " mil") + (resto === 0 ? "" : " " + convertirCentenas(resto));
        }
        if (num === 1000000)
            return "un millón";
        if (num < 1000000000) {
            const millones = Math.floor(num / 1000000);
            const resto = num % 1000000;
            return (millones === 1 ? "un millón" : convertirCentenas(millones) + " millones") + (resto === 0 ? "" : " " + convertirMiles(resto));
        }
        return "Número fuera de rango"; // Para números mayores a mil millones
    }
    return convertirMiles(num).trim();
}
//# sourceMappingURL=utils.js.map