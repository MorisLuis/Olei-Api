import { Request, Response } from 'express';
import { closeDbConnection, dbConnection } from '../database';



const getUtils = async (req: Request, res: Response) => {


    try {

        console.log(numeroALetra(500));        // Quinientos
        console.log(numeroALetra(1234));       // Mil doscientos treinta y cuatro
        console.log(numeroALetra(1234567));    // Un millón doscientos treinta y cuatro mil quinientos sesenta y siete
        console.log(numeroALetra(123456789));


        res.json({
            ok: true
        })

    } catch (error) {
        res.status(500).send(error);
    }
};

export {
    getUtils
};

function numeroALetra(num: number): string {
    const unidades: string[] = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const decenas: string[] = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const especiales: string[] = ["", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
    const centenas: string[] = ["", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];
    
    function convertirCentenas(num: number): string {
        if (num < 10) return unidades[num];
        if (num < 20) return especiales[num - 10];
        if (num < 100) return decenas[Math.floor(num / 10)] + (num % 10 === 0 ? "" : " y " + unidades[num % 10]);
        if (num === 100) return "cien";
        if (num < 1000) return centenas[Math.floor(num / 100)] + (num % 100 === 0 ? "" : " " + convertirCentenas(num % 100));
        return "";
    }

    function convertirMiles(num: number): string {
        if (num < 1000) return convertirCentenas(num);
        if (num === 1000) return "mil";
        if (num < 1000000) {
            const miles = Math.floor(num / 1000);
            const resto = num % 1000;
            return (miles === 1 ? "mil" : convertirCentenas(miles) + " mil") + (resto === 0 ? "" : " " + convertirCentenas(resto));
        }
        if (num === 1000000) return "un millón";
        if (num < 1000000000) {
            const millones = Math.floor(num / 1000000);
            const resto = num % 1000000;
            return (millones === 1 ? "un millón" : convertirCentenas(millones) + " millones") + (resto === 0 ? "" : " " + convertirMiles(resto));
        }
        return "Número fuera de rango"; // Para números mayores a mil millones
    }

    return convertirMiles(num).trim();
}
