import { Request, Response } from 'express';
import { closeDbConnection, dbConnection } from '../database';
import { handleGetWebSession } from '../utils/Redis/getSession';
import BadRequestError from '../errors/BadRequestError';


const getBanner = async (req: Request, res: Response) => {

    const sessionId = req.sessionRedis;
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    };

    const database = userFR?.Baseweb
    const databaseSplit = database?.split('_')
    const newPath = databaseSplit?.[1]?.toLowerCase().trim();
    const banner = newPath ? `https://oleistorage.blob.core.windows.net/${newPath}/BANNER.png` : '/Banner_olei.png';

    res.json({
        banner
    });
}


const getUtils = async (req: Request, res: Response) => {

    try {

        res.json({
            ok: true
        })

    } catch (error) {
        res.status(500).send(error);
    }
};

export {
    getBanner,
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
