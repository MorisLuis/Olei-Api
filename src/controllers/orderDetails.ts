import { Request, Response } from "express";
import { dbConnection, querys } from "../database";
import sql from 'mssql';
import { sharedData } from "../app";
import PorductInterface from "../interface/product";


const postOrderDetails = async (req: Request, res: Response) => {

    try {
        const postArray = req.body;
        const client = sharedData?.currentClient?.client;
        const connection = sharedData?.userConnection?.connection
        const user = sharedData?.currentUser?.user;

        //Temporal
        const Id_Almacen = client?.Id_Almacen;
        const Id_Cliente = client?.Id_Cliente;
        const Id_ListPre = client?.Id_ListPre;
        const database = connection?.database;

        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const transaction = new sql.Transaction(pool);

        try {

            // Inicia la transacción
            await transaction.begin();
            const request = new sql.Request(transaction);
            let count = 0;

            for (const postData of postArray) {
                const request = new sql.Request(transaction);
                count++;

                postData.Codigo = postData.Codigo;
                postData.Cantidad = postData.Piezas;

                const previewDataToPostOrderDetails = querys.getPreviewDataToPostOrderDetails;

                const result = await request
                    .input("database", database)
                    .input("Codigo", postData.Codigo)
                    .input("Id_Marca", postData.Id_Marca)
                    .input("Id_Almacen", Id_Almacen)
                    .input("Id_Cliente", Id_Cliente)
                    .query(previewDataToPostOrderDetails);

                // Accede a los resultados
                const results: any = result.recordset[0];
                const { SerieActiva, Folio, Valor, Id_Unidad, SwNs, SKU, Costo } = results;

                if (!results) {
                    return res.status(404).json({ error: 'No se encontraron resultados en la consulta.' });
                }

                postData.Id_Almacen = Id_Almacen;
                postData.TipoDoc = user?.TipoDocOO;
                postData.Serie = SerieActiva ? SerieActiva : "";
                postData.Folio = Folio + 1;
                postData.Id_ListaPrecios = Id_ListPre;
                postData.Descuento = Valor;
                postData.Id_Unidad = Id_Unidad;
                postData.SwNs = SwNs;
                postData.TasaImpuesto = process.env.PUBLIC_TAX_RATE;
                postData.SKU = SKU;
                postData.Partida = count;
                postData.Importe = postData.Precio * postData.Piezas;
                postData.Impuesto = (postData.Precio * postData.Piezas * (postData.Impto / 100));
                postData.Costo = Costo

                // Define la consulta SQL para la inserción de datos
                const postOrderDetailsQuery = querys.insertOrderDetails;

                // Define una función para asignar los parámetros
                const assignParameter = (parameterName: string, sqlType: any, value: any) => {
                    request.input(parameterName, sqlType, value);
                };

                const parameters = {
                    Id_Almacen: { type: sql.Int, value: Id_Almacen },
                    TipoDoc: { type: sql.SmallInt, value: 3 },
                    Serie: { type: sql.NChar(10), value: postData.Serie },
                    Folio: { type: sql.Int, value: postData.Folio },
                    Codigo: { type: sql.NChar(20), value: postData.Codigo },
                    Id_Marca: { type: sql.Int, value: postData.Id_Marca },
                    Id_ListaPrecios: { type: sql.Int, value: postData.Id_ListaPrecios },
                    Cantidad: { type: sql.Decimal(18, 6), value: postData.Cantidad },
                    Precio: { type: sql.Decimal(18, 6), value: postData.Precio },
                    Importe: { type: sql.Decimal(18, 6), value: postData.Importe },
                    Impuesto: { type: sql.Decimal(18, 6), value: postData.Impuesto },
                    Descripcion: { type: sql.VarChar(4000), value: postData.Descripcion },
                    Descuento: { type: sql.Decimal(18, 6), value: postData.Descuento },
                    Id_Unidad: { type: sql.Int, value: postData.Id_Unidad },
                    SwNs: { type: sql.Bit, value: postData.SwNs },
                    TasaImpuesto: { type: sql.Money, value: postData.TasaImpuesto },
                    SKU: { type: sql.NChar(20), value: postData.SKU },
                    Partida: { type: sql.SmallInt, value: postData.Partida },
                    Costo: { type: sql.Decimal(18, 6), value: postData.Costo },
                }

                // Asigna los parámetros utilizando la función
                for (const parameterName in parameters) {
                    if (Object.prototype.hasOwnProperty.call(parameters, parameterName)) {
                        const parameter = parameters[parameterName as keyof typeof parameters];
                        assignParameter(parameterName, parameter.type, parameter.value);
                    }
                }

                // Ejecuta la consulta SQL dentro de la transacción
                await request.query(postOrderDetailsQuery);

            }

            // Confirma la transacción
            await transaction.commit();

            res.status(201).json({
                orderDetails: request.parameters
            });

        } catch (error) {
            await transaction.rollback();
            throw error;
        } finally {
            if (pool) {
                await pool.close();
            }
        }

    } catch (error: any) {
        console.error('Error al crear el post:', error.message);
        res.status(500).json({ error: error });
    }
}

const getOrderDetails = async (req: Request, res: Response) => {

    const { folio } = req.query;
    const connection = sharedData?.userConnection?.connection;
    const database = connection?.database;

    if (!folio) {
        res.status(500).json({ error: 'No se envio el folio' });
        return;
    }

    try {
        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        };

        const query = querys.getOrderDetails;

        const request = await pool.request()
            .input('database', database)
            .input('folio', sql.Int, folio)
            .query(query);

        let orderDetails: PorductInterface[] = request.recordset;

        res.json(orderDetails)

    } catch (error) {
        res.status(500).json({ error: error });
    }
}

export {
    postOrderDetails,
    getOrderDetails
}