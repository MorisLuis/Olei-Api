import { Request, Response } from 'express';
import { closeDbConnection, dbConnection } from '../database';
import { Builder } from 'xml2js';

// Definir la interfaz para los objetos del arreglo
interface Item {
    Id_Almacen: number;
    Folio: number;
    Partida: number;
    Codigo: string;
    Id_Marca: number;
    Cantidad: number;
    Id_Ubicacion: number;
    Diferencia: number;
    SwNS?: number;
    NumsDeSerie?: string;
    SKU?: string;
}

// Función para convertir el arreglo de objetos a XML
function convertArrayToXml(objectsArray: Item[]): Promise<string> {
    const builder = new Builder();
    const xml = builder.buildObject({ Root: { Item: objectsArray } });
    return Promise.resolve(xml);
}

const getUtils = async (req: Request, res: Response) => {
    const serverWeb = process.env.DB_SERVER;
    const baseWeb = process.env.DB_DATABASE;

    console.log({serverWeb, baseWeb})
    console.log("hellow!!")
    
    try {
        const pool = await dbConnection(serverWeb, baseWeb);

        // Simulación de un arreglo de objetos (reemplaza esto con la consulta real)
        const objectsArray: Item[] = [
            {
                Id_Almacen: 1,
                Folio: 1001,
                Partida: 1,
                Codigo: 'ABC123',
                Id_Marca: 5,
                Cantidad: 50,
                Id_Ubicacion: 10,
                Diferencia: 5,
                SwNS: 0,
                NumsDeSerie: '12345',
                SKU: 'SKU001'
            },
            {
                Id_Almacen: 1,
                Folio: 1002,
                Partida: 2,
                Codigo: 'DEF456',
                Id_Marca: 6,
                Cantidad: 30,
                Id_Ubicacion: 20,
                Diferencia: 3,
                SwNS: 1,
                NumsDeSerie: '67890',
                SKU: 'SKU002'
            }
        ];

        // Convertir el arreglo de objetos a XML
        const xml = await convertArrayToXml(objectsArray);

        // Enviar el XML como respuesta
        res.set('Content-Type', 'application/xml');
        res.send(xml);

    } catch (error: any) {
        console.log({ getUtilsError: error });
        res.status(500).send(error.message);
    } finally {
        await closeDbConnection();
    }
};

export {
    getUtils
};
