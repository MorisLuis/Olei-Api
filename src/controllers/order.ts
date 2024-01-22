import { Request, Response } from "express"
import { dbConnection, querys } from "../database";
import sql from 'mssql';
import moment from 'moment-timezone';
import { sharedData } from "../app";
import OrderInterface from "../interface/order";


const postOrder = async (req: Request, res: Response) => {

    try {
        const postData = req.body;
        const client = sharedData?.currentClient?.client;
        const user = sharedData?.currentUser?.user;
        const connection = sharedData?.userConnection?.connection
        const Id_Almacen = client?.Id_Almacen;
        const Id_Cliente = client?.Id_Cliente;
        const Id_ListPre = client?.Id_ListPre;
        const Id_Usuario = connection?.user;
        const TipoDocOO = user?.TipoDocOO;

        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            const currentDate = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss.SSS');


            const previewDataToPostOrder = await request
                .input("Id_Almacen_Preview", Id_Almacen)
                .input("Id_Cliente_Preview", Id_Cliente)
                .query(querys.getPreviewDataToPostOrder)

            const results = previewDataToPostOrder.recordset[0];
            const { SerieActiva, Folio, Id_Descuento, Id_CondVta, Id_Vendedor, Id_FormaPago, Id_Transporte } = results;

            if (!results) {
                return res.status(404).json({ error: 'No se encontraron resultados en la consulta.' });
            }

            postData.TipoDoc = TipoDocOO;
            postData.Serie = SerieActiva ? SerieActiva : "";
            postData.Folio = Folio + 1;
            postData.Id_Cliente = Id_Cliente;
            postData.Id_AlmacenClte = Id_Almacen;
            postData.Fecha = currentDate;
            postData.Total = postData.Total;
            postData.Impuesto = postData.Total - postData.Subtotal;
            postData.Subtotal = postData.Subtotal;
            postData.Saldo = postData.Total;
            postData.Id_Descuento = Id_Descuento;
            postData.Id_CondVta = Id_CondVta;
            postData.Id_Vendedor = Id_Vendedor;
            postData.Id_FormaPago = Id_FormaPago;
            postData.Id_Transporte = Id_Transporte;
            postData.FechaLiq = postData.Fecha;
            postData.Estado = 1;
            postData.Moneda = 1;
            postData.Paridad = 1;
            postData.Suma = postData.Subtotal;
            postData.Id_Usuario = Id_Usuario;
            postData.CantDescuento = 0;
            postData.Id_ListPre = Id_ListPre;
            postData.Id_TipoPago = 1;
            postData.TipoDocOrigen = 11;

            const postOrderQuery = querys.insertOrder;

            const result = await request
                .input("Id_Almacen", sql.Int, Id_Almacen)
                .input("TipoDoc", sql.SmallInt, postData.TipoDoc)
                .input("Serie", sql.NChar(10), postData.Serie)
                .input("Folio", sql.Int, postData.Folio)
                .input("Id_Cliente", sql.Int, postData.Id_Cliente)
                .input("Id_AlmacenClte", sql.Int, postData.Id_AlmacenClte)
                .input("Fecha", sql.DateTime, postData.Fecha)
                .input("Subtotal", sql.Money, postData.Subtotal)
                .input("Impuesto", sql.Decimal(18, 6), postData.Impuesto)
                .input("Total", sql.Money, postData.Total)
                .input("Saldo", sql.Money, postData.Saldo)
                .input("Id_Descuento", sql.Int, postData.Id_Descuento)
                .input("Id_CondVta", sql.Int, postData.Id_CondVta)
                .input("Id_Vendedor", sql.Int, postData.Id_Vendedor)
                .input("Id_Formapago", sql.Int, postData.Id_Formapago)
                .input("Id_Transporte", sql.Int, postData.Id_Transporte)
                .input("FechaLiq", sql.DateTime, postData.FechaLiq)
                .input("Estado", sql.SmallInt, postData.Estado)
                .input("Notas", sql.VarChar(4000), postData.Notas)
                .input("DocsOrigen", sql.VarChar(4000), postData.DocsOrigen)
                .input("DocsDestino", sql.VarChar(4000), postData.DocsDestino)
                .input("TipoDocOrigen", sql.SmallInt, postData.TipoDocOrigen)
                .input("TipoDocDestino", sql.SmallInt, postData.TipoDocDestino)
                .input("Piezas", sql.Numeric(18, 2), postData.Piezas)
                .input("Retencion", sql.Decimal(18, 6), postData.Retencion)
                .input("RetencionIVA", sql.Decimal(18, 6), postData.RetencionIVA)
                .input("Moneda", sql.Int, postData.Moneda)
                .input("Paridad", sql.Decimal(18, 6), postData.Paridad)
                .input("TipoEntrega", sql.SmallInt, postData.TipoEntrega)
                .input("DatoOB1", sql.NChar(100), postData.DatoOB1)
                .input("DatoOB2", sql.NChar(100), postData.DatoOB2)
                .input("DatoOB3", sql.NChar(100), postData.DatoOB3)
                .input("NumCtaPago", sql.NChar(30), postData.NumCtaPago)
                .input("Suma", sql.Decimal(18, 6), postData.Suma)
                .input("SwImpOrg", sql.Bit, postData.SwImpOrg)
                .input("SwPag", sql.Bit, postData.SwPag)
                .input("Id_Usuario", sql.NChar(50), postData.Id_Usuario)
                .input("CantDescuento", sql.Decimal(18, 6), postData.CantDescuento)
                .input("Id_ListPre", sql.Int, postData.Id_ListPre)
                .input("CantLetra", sql.VarChar(200), postData.CantLetra)
                .input("Id_TipoPago", sql.Int, postData.Id_TipoPago)
                .input("Id_Uso", sql.Int, postData.Id_Uso)
                .input("ClaveConfirm", sql.NChar(20), postData.ClaveConfirm)
                .input("SwAnticipo", sql.Bit, postData.SwAnticipo)
                .input("SaldoAnticipo", sql.Decimal(18, 6), postData.SaldoAnticipo)
                .input("DocsRel", sql.VarChar(200), postData.DocsRel)
                .input("SwNotaAnticipo", sql.Bit, postData.SwNotaAnticipo)
                .input("ImporteNotaAnticipo", sql.Decimal(18, 6), postData.ImporteNotaAnticipo)
                .input("TipoRel", sql.Int, postData.TipoRel)
                .input("Id_FormaPago2", sql.Int, postData.Id_FormaPago2)
                .input("Id_FormaPago3", sql.Int, postData.Id_FormaPago3)
                .input("Pago1", sql.Decimal(18, 6), postData.Pago1)
                .input("Pago2", sql.Decimal(18, 6), postData.Pago2)
                .input("Pago3", sql.Decimal(18, 6), postData.Pago3)
                .input("Cambio", sql.Decimal(18, 6), postData.Cambio)
                .input("SwPagada", sql.Bit, postData.SwPagada)
                .input("FolioCaja", sql.Int, postData.FolioCaja)
                .input("Id_Chofer", sql.Int, postData.Id_Chofer)
                .input("FechaEntrega", sql.DateTime, postData.FechaEntrega)
                .query(postOrderQuery);

            await transaction.commit();
            const order = result.recordset[0];
            res.status(201).json(order);

        } catch (error) {
            await transaction.rollback();
            throw error;
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    } catch (error: any) {
        console.error('Error al crear el post:', error);
        res.status(500).json({ error: error });
    }
};

const getOrder = async (req: Request, res: Response) => {

    const { folio } = req.params;
    const client = sharedData?.currentClient?.client;
    const Id_Cliente = client?.Id_Cliente;
    const user = sharedData?.currentUser?.user;
    const TipoDocOO = user?.TipoDocOO;

    try {
        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const getOrderQuery = querys.getOrder;

        const request = await pool.request()
            .input('Id_Cliente', sql.Int, Id_Cliente)
            .input('folio', sql.Int, folio)
            .input('TipoDocOO', TipoDocOO)
            .query(getOrderQuery);

        let order: OrderInterface = request.recordset[0];

        res.json(order)

    } catch (error) {
        res.status(500).json({ error: error });
    }
}

const getAllOrders = async (req: Request, res: Response) => {

    const user = sharedData?.currentUser?.user;
    const client = sharedData?.currentClient?.client;
    const Id_Cliente = client?.Id_Cliente;
    const TipoDocOO = user?.TipoDocOO;


    try {
        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const query = querys.getAllOrders;

        const request = await pool.request()
            .input('TipoDocOO', TipoDocOO)
            .input('Id_Cliente', sql.Int, Id_Cliente)
            .query(query);


        let allOrders: OrderInterface[] = request.recordset;

        res.json(allOrders);

    } catch (error) {
        console.log({ error })
        res.status(500).json({ error: error });
    }
}

export {
    postOrder,
    getOrder,
    getAllOrders
}