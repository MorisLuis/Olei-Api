import { Request, Response } from "express";
import { dbConnection } from "../database";
import sql from 'mssql';
import { sharedData } from "../app";
import PorductInterface from "../interface/product";


const postOrderDetails = async (req: Request, res: Response) => {

    try {
        const postArray = req.body;
        const user = sharedData?.currentUser?.user;
        const connection = sharedData?.userConnection?.connection


        //Temporal
        const Id_Almacen = user?.Id_Almacen;
        const Id_Cliente = user?.Id_Cliente;
        const Id_ListPre = user?.Id_ListPre;
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

                const firstQuery = `
                SELECT 
                    (SELECT Folio FROM [${database}].[dbo].[VENTAS] WHERE Folio = (SELECT MAX(Folio) FROM [${database}].[dbo].[VENTAS])) AS Folio,
                    (SELECT TRIM(SerieActiva) FROM [${database}].[dbo].[DATOSFISCALES] WHERE Id_Almacen = ${Id_Almacen}) AS SerieActiva,
                    (SELECT Id_Descuento FROM [${database}].[dbo].[CLIENTES] WHERE Id_Cliente = ${Id_Cliente} AND Id_Almacen = ${Id_Almacen}) AS Id_Descuento,
                    (SELECT Valor FROM [${database}].[dbo].[DESCUENTOS] WHERE Id_Descuento = (SELECT Id_Descuento FROM [${database}].[dbo].[CLIENTES] WHERE Id_Cliente = ${Id_Cliente} AND Id_Almacen = ${Id_Almacen})) AS Valor,
                    P.SwNs,
                    TRIM(P.SKU) AS SKU,
                    P.Id_Unidad AS Id_Unidad
                FROM [${database}].[dbo].[PRODUCTOS] AS P
                WHERE TRIM(P.Codigo) = '${postData.Codigo}'
            `
                const result = await request.query(firstQuery);

                // Accede a los resultados
                const results: any = result.recordset[0];

                if (!results) {
                    return res.status(404).json({ error: 'No se encontraron resultados en la consulta.' });
                }

                postData.Id_Almacen = Id_Almacen;
                postData.TipoDoc = 3;
                postData.Serie = results.SerieActiva ? results.SerieActiva : "";
                postData.Folio = results.Folio + 1;
                postData.Id_ListaPrecios = Id_ListPre;
                postData.Descuento = results?.Valor;
                postData.Id_Unidad = results?.Id_Unidad;
                postData.SwNs = results?.SwNs;
                postData.TasaImpuesto = process.env.PUBLIC_TAX_RATE;
                postData.SKU = results?.SKU;
                postData.Partida = count;

                // Define la consulta SQL para la inserción de datos
                const query = `
                        INSERT INTO [OLEIDB1].[dbo].[DETALLEVENTAS]  (
                            Id_Almacen, TipoDoc, Serie, Folio, Codigo, Id_Marca, Id_ListaPrecios, Cantidad,
                            Precio, Importe, Impuesto, Descripcion, Descuento, Id_Unidad, SwNs, TasaImpuesto, SKU, Partida
                        ) 
                        VALUES (
                            @Id_Almacen, @TipoDoc, @Serie, @Folio, @Codigo, @Id_Marca, @Id_ListaPrecios, @Cantidad,
                            @Precio, @Importe, @Impuesto, @Descripcion, @Descuento, @Id_Unidad, @SwNs, @TasaImpuesto, @SKU, @Partida
                        );
                    `;

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
                    Partida: { type: sql.SmallInt, value: postData.Partida }
                }

                // Asigna los parámetros utilizando la función
                for (const parameterName in parameters) {
                    if (Object.prototype.hasOwnProperty.call(parameters, parameterName)) {
                        const parameter = parameters[parameterName as keyof typeof parameters];
                        assignParameter(parameterName, parameter.type, parameter.value);
                    }
                }

                // Ejecuta la consulta SQL dentro de la transacción
                await request.query(query);

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
        }

        const query = `
            SELECT D.Precio, D.Cantidad as Piezas, D.Importe, D.Impuesto, D.Id_Marca, D.Id_Almacen, D.Id_ListaPrecios, D.Folio, TRIM(D.Descripcion) AS Descripcion, TRIM(D.Codigo) AS Codigo, E.Existencia
            FROM [${database}].[dbo].[DETALLEVENTAS] AS D
            INNER JOIN [${database}].[dbo].[EXISTENCIAS] AS E ON D.Codigo = E.Codigo AND D.Id_Marca = E.Id_Marca AND D.Id_Almacen = E.Id_Almacen
            WHERE Folio = @folio
            ORDER BY Folio DESC
        `;

        const request = pool.request();
        request.input('folio', sql.Int, folio);

        const consult = await request.query(query);
        let results: PorductInterface[] = consult.recordset;

        res.json(results)

    } catch (error) {
        res.status(500).json({ error: error });
    }
}

export {
    postOrderDetails,
    getOrderDetails
}