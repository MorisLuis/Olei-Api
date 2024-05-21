import { Request, Response } from "express";
import { dbConnection } from "../database";
import sql from 'mssql';
import { sharedData } from "..";
import PorductInterface from "../interface/product";
import { orderQuerys } from "../database/querys/orders";


const postOrderDetails = async (req: Request, res: Response) => {

    try {
        const postArray = req.body;
        const client = sharedData?.currentClient?.client;
        const user = sharedData?.currentUser?.user;
        const Id_Almacen = client?.Id_Almacen;
        const Id_Cliente = client?.Id_Cliente;
        const Id_ListPre = client?.Id_ListPre;

        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();
            let count = 0;
            const orderDetails = [];  // Store every orderDetails from the for.

            for (const postData of postArray) {
                const request = new sql.Request(transaction);
                count++;

                postData.Cantidad = postData.Piezas;

                const previewDataToPostOrderDetails = orderQuerys.getPreviewDataToPostOrderDetails;

                const result = await request
                    .input("Codigo_Preview", postData.Codigo)
                    .input("Id_Marca_Preview", postData.Id_Marca)
                    .input("Id_Almacen_Preview", Id_Almacen)
                    .input("Id_Cliente_Preview", Id_Cliente)
                    .query(previewDataToPostOrderDetails);

                const results: any = result.recordset[0];
                const { SerieActiva, Folio, Valor, Id_Unidad, SwNs, SKU, Costo } = results;


                if (!results) {
                    return res.status(404).json({ error: 'No se encontraron resultados en la consulta.' });
                }

                postData.Id_Almacen = Id_Almacen;
                postData.TipoDoc = user?.TipoDocOO;
                postData.Serie = SerieActiva ? SerieActiva : "";
                postData.Folio = (Folio ? Folio : 0) + 1;
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

                const postOrderDetailsQuery = orderQuerys.insertOrderDetails;

                const resultOrderPost = await request
                    .input("Id_Almacen", sql.Int, Id_Almacen)
                    .input("TipoDoc", sql.SmallInt, 3)
                    .input("Serie", sql.NChar(10), postData.Serie)
                    .input("Folio", sql.Int, postData.Folio)
                    .input("Codigo", sql.NChar(20), postData.Codigo)
                    .input("Id_Marca", sql.Int, postData.Id_Marca)
                    .input("Id_ListaPrecios", sql.Int, postData.Id_ListaPrecios)
                    .input("Cantidad", sql.Decimal(18, 6), postData.Cantidad)
                    .input("Precio", sql.Decimal(18, 6), postData.Precio)
                    .input("Importe", sql.Decimal(18, 6), postData.Importe)
                    .input("Impuesto", sql.Decimal(18, 6), postData.Impuesto)
                    .input("Descripcion", sql.VarChar(4000), postData.Descripcion)
                    .input("Descuento", sql.Decimal(18, 6), postData.Descuento)
                    .input("Id_Unidad", sql.Int, postData.Id_Unidad)
                    .input("SwNs", sql.Bit, postData.SwNs)
                    .input("TasaImpuesto", sql.Money, postData.TasaImpuesto)
                    .input("SKU", sql.NChar(20), postData.SKU)
                    .input("Partida", sql.SmallInt, postData.Partida)
                    .input("Costo", sql.Decimal(18, 6), postData.Costo)
                    .query(postOrderDetailsQuery);

                orderDetails.push(resultOrderPost.recordset[0]);

            }

            await transaction.commit();

            res.json(orderDetails)


        } catch (error) {
            console.log({ error })
            await transaction.rollback();
            throw error;
        } finally {
            if (pool) {
                await pool.close();
            }
        }

    } catch (error: any) {
        console.error('Error al crear el orde details:', error.message);
        res.status(500).json({ error: error });
    }
}

const getOrderDetails = async (req: Request, res: Response) => {

    const { folio } = req.query;

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

        const query = orderQuerys.getOrderDetails;

        const request = await pool.request()
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