"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUtils = void 0;
const database_1 = require("../database");
const xml2js_1 = require("xml2js");
// Función para convertir el arreglo de objetos a XML
function convertArrayToXml(objectsArray) {
    const builder = new xml2js_1.Builder();
    const xml = builder.buildObject({ Root: { Item: objectsArray } });
    return Promise.resolve(xml);
}
const getUtils = async (req, res) => {
    const serverWeb = process.env.DB_SERVER;
    const baseWeb = process.env.DB_DATABASE;
    try {
        const pool = await (0, database_1.dbConnection)(serverWeb, baseWeb);
        // Simulación de un arreglo de objetos (reemplaza esto con la consulta real)
        const objectsArray = [
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
    }
    catch (error) {
        console.log({ getUtilsError: error });
        res.status(500).send(error.message);
    }
    finally {
        await (0, database_1.closeDbConnection)();
    }
};
exports.getUtils = getUtils;
//# sourceMappingURL=utils.js.map