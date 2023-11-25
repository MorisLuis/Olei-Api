import { Request, Response } from "express"
import { dbConnection } from "../database";
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
        const database = connection?.database;
        const Id_Usuario = connection?.user;

        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const transaction = new sql.Transaction(pool);
        // Inicia la transacción
        await transaction.begin();


        try {
            // Crea una nueva instancia de Request dentro de la transacción
            const request = new sql.Request(transaction);
            const currentDate = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss.SSS');

            const result = await request.query(`
                SELECT 
                    (
                        SELECT TOP 1 Folio FROM [${database}].[dbo].[VENTAS]
                        WHERE Folio = (SELECT MAX(Folio) FROM [${database}].[dbo].[VENTAS])
                    ) AS Folio,
                    (
                        SELECT SerieActiva FROM [${database}].[dbo].[DATOSFISCALES]
                        WHERE Id_Almacen = ${Id_Almacen}
                    ) AS SerieActiva,
                    Id_Descuento, Id_CondVta, Id_Vendedor, Id_FormaPago, Id_Transporte
                    FROM [${database}].[dbo].[CLIENTES]
                    WHERE Id_Cliente = ${Id_Cliente} AND Id_Almacen = ${Id_Almacen};
            `);

            // Accede a los resultados
            const results: any = result.recordset[0];

            if (!results) {
                return res.status(404).json({ error: 'No se encontraron resultados en la consulta.' });
            }

            // Modifica la fecha en el objeto postData con el valor deseado
            postData.Id_Almacen = Id_Almacen;
            postData.TipoDoc = user?.TipoDocOO;
            postData.Serie = results.SerieActiva ? results.SerieActiva : "";
            postData.Folio = results?.Folio + 1;
            postData.Id_Cliente = Id_Cliente;
            postData.Id_AlmacenClte = Id_Almacen;
            postData.Fecha = currentDate;
            postData.Total = postData.Total;
            postData.Impuesto = postData.Total - postData.Subtotal;
            postData.Subtotal = postData.Subtotal;
            postData.Saldo = postData.Total;
            postData.Id_Descuento = results?.Id_Descuento;
            postData.Id_CondVta = results?.Id_CondVta;
            postData.Id_Vendedor = results?.Id_Vendedor;
            postData.Id_FormaPago = results?.Id_FormaPago;
            postData.Id_Transporte = results?.Id_Transporte;
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

            // Define la consulta SQL para la inserción de datos
            const query = `
                INSERT INTO [OLEIDB1].[dbo].[VENTAS]  (
                    Id_Cliente, Id_Almacen, Id_AlmacenClte, TipoDoc, Serie, Folio, Fecha,
                    Subtotal, Impuesto, Total, Saldo, Id_Descuento, Id_CondVta, Id_Vendedor, Id_Formapago,
                    Id_Transporte, FechaLiq, Estado, Piezas, Moneda, Paridad, CantDescuento,
                    Suma, Id_Usuario, Id_ListPre, CantLetra, FechaEntrega
                ) 
                VALUES (
                    @Id_Cliente, @Id_Almacen, @Id_AlmacenClte, @TipoDoc, @Serie, @Folio, @Fecha,
                    @Subtotal, @Impuesto, @Total, @Saldo, @Id_Descuento, @Id_CondVta, @Id_Vendedor, @Id_Formapago,
                    @Id_Transporte, @FechaLiq, @Estado, @Piezas, @Moneda, @Paridad, @CantDescuento,
                    @Suma, @Id_Usuario, @Id_ListPre, @CantLetra, @FechaEntrega
                );
            `;

            // Define una función para asignar los parámetros
            const assignParameter = (parameterName: string, sqlType: any, value: any) => {
                request.input(parameterName, sqlType, value);
            };

            // Define un objeto con los nombres de los parámetros y sus tipos de datos y valores
            const parameters = {
                Id_Almacen: { type: sql.Int, value: postData.Id_Almacen },
                TipoDoc: { type: sql.SmallInt, value: postData.TipoDoc },
                Serie: { type: sql.NChar(10), value: postData.Serie },
                Folio: { type: sql.Int, value: postData.Folio },
                Id_Cliente: { type: sql.Int, value: postData.Id_Cliente },
                Id_AlmacenClte: { type: sql.Int, value: postData.Id_AlmacenClte },
                Fecha: { type: sql.DateTime, value: postData.Fecha },
                Subtotal: { type: sql.Money, value: postData.Subtotal },
                Impuesto: { type: sql.Decimal(18, 6), value: postData.Impuesto },
                Total: { type: sql.Money, value: postData.Total },
                Saldo: { type: sql.Money, value: postData.Saldo },
                Id_Descuento: { type: sql.Int, value: postData.Id_Descuento },
                Id_CondVta: { type: sql.Int, value: postData.Id_CondVta },
                Id_Vendedor: { type: sql.Int, value: postData.Id_Vendedor },
                Id_Formapago: { type: sql.Int, value: postData.Id_Formapago },
                Id_Transporte: { type: sql.Int, value: postData.Id_Transporte },
                FechaLiq: { type: sql.DateTime, value: postData.FechaLiq },
                Estado: { type: sql.SmallInt, value: postData.Estado },
                Notas: { type: sql.VarChar(4000), value: postData.Notas },
                DocsOrigen: { type: sql.VarChar(4000), value: postData.DocsOrigen },
                DocsDestino: { type: sql.VarChar(4000), value: postData.DocsDestino },
                TipoDocOrigen: { type: sql.SmallInt, value: postData.TipoDocOrigen },
                TipoDocDestino: { type: sql.SmallInt, value: postData.TipoDocDestino },
                Piezas: { type: sql.Numeric(18, 2), value: postData.Piezas },
                Retencion: { type: sql.Decimal(18, 6), value: postData.Retencion },
                RetencionIVA: { type: sql.Decimal(18, 6), value: postData.RetencionIVA },
                Moneda: { type: sql.Int, value: postData.Moneda },
                Paridad: { type: sql.Decimal(18, 6), value: postData.Paridad },
                TipoEntrega: { type: sql.SmallInt, value: postData.TipoEntrega },
                DatoOB1: { type: sql.NChar(100), value: postData.DatoOB1 },
                DatoOB2: { type: sql.NChar(100), value: postData.DatoOB2 },
                DatoOB3: { type: sql.NChar(100), value: postData.DatoOB3 },
                NumCtaPago: { type: sql.NChar(30), value: postData.NumCtaPago },
                Suma: { type: sql.Decimal(18, 6), value: postData.Suma },
                SwImpOrg: { type: sql.Bit, value: postData.SwImpOrg },
                SwPag: { type: sql.Bit, value: postData.SwPag },
                Id_Usuario: { type: sql.NChar(50), value: postData.Id_Usuario },
                CantDescuento: { type: sql.Decimal(18, 6), value: postData.CantDescuento },
                Id_ListPre: { type: sql.Int, value: postData.Id_ListPre },
                CantLetra: { type: sql.VarChar(200), value: postData.CantLetra },
                Id_TipoPago: { type: sql.Int, value: postData.Id_TipoPago },
                Id_Uso: { type: sql.Int, value: postData.Id_Uso },
                ClaveConfirm: { type: sql.NChar(20), value: postData.ClaveConfirm },
                SwAnticipo: { type: sql.Bit, value: postData.SwAnticipo },
                SaldoAnticipo: { type: sql.Decimal(18, 6), value: postData.SaldoAnticipo },
                DocsRel: { type: sql.VarChar(200), value: postData.DocsRel },
                SwNotaAnticipo: { type: sql.Bit, value: postData.SwNotaAnticipo },
                ImporteNotaAnticipo: { type: sql.Decimal(18, 6), value: postData.ImporteNotaAnticipo },
                TipoRel: { type: sql.Int, value: postData.TipoRel },
                Id_FormaPago2: { type: sql.Int, value: postData.Id_FormaPago2 },
                Id_FormaPago3: { type: sql.Int, value: postData.Id_FormaPago3 },
                Pago1: { type: sql.Decimal(18, 6), value: postData.Pago1 },
                Pago2: { type: sql.Decimal(18, 6), value: postData.Pago2 },
                Pago3: { type: sql.Decimal(18, 6), value: postData.Pago3 },
                Cambio: { type: sql.Decimal(18, 6), value: postData.Cambio },
                SwPagada: { type: sql.Bit, value: postData.SwPagada },
                FolioCaja: { type: sql.Int, value: postData.FolioCaja },
                Id_Chofer: { type: sql.Int, value: postData.Id_Chofer },
                FechaEntrega: { type: sql.DateTime, value: postData.FechaEntrega },
            };

            // Asigna los parámetros utilizando la función
            for (const parameterName in parameters) {
                if (Object.prototype.hasOwnProperty.call(parameters, parameterName)) {
                    const parameter = parameters[parameterName as keyof typeof parameters];
                    assignParameter(parameterName, parameter.type, parameter.value);
                }
            }

            // Ejecuta la consulta SQL dentro de la transacción
            await request.query(query);

            // Confirma la transacción
            await transaction.commit();

            res.status(201).json({
                order: request.parameters
            });
        } catch (error) {
            await transaction.rollback();
            console.log({ error })
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
    const connection = sharedData?.userConnection?.connection;
    const Id_Cliente = client?.Id_Cliente;
    const database = connection?.database;

    try {
        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const query = `
            SELECT V.Folio, V.Piezas, V.Subtotal, V.Impuesto, V.Total, V.Fecha, C.Nombre as Cliente, VE.Nombre as Vendedor
            FROM [${database}].[dbo].[VENTAS] AS V
            INNER JOIN [${database}].[dbo].[CLIENTES] AS C ON V.Id_Cliente = C.Id_Cliente AND V.Id_Almacen = C.Id_Almacen
            INNER JOIN [${database}].[dbo].[VENDEDORES] AS VE ON V.Id_Vendedor = VE.Id_Vendedor
            WHERE V.Id_Cliente = @Id_Cliente AND TipoDoc = 3 AND Folio = @folio
        `

        const request = pool.request();
        request.input('Id_Cliente', sql.Int, Id_Cliente);
        request.input('folio', sql.Int, folio);


        const consult = await request.query(query);
        let results: OrderInterface = consult.recordset[0];

        res.json(results)

    } catch (error) {
        res.status(500).json({ error: error });
    }
}

const getAllOrders = async (req: Request, res: Response) => {

    const user = sharedData?.currentUser?.user;
    const client = sharedData?.currentClient?.client;
    const Id_Cliente = client?.Id_Cliente;
    const connection = sharedData?.userConnection?.connection
    const database = connection?.database;
    const TipoDocOO = user?.TipoDocOO;

    try {
        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const query = `
            SELECT V.Folio, V.Piezas, V.Subtotal, V.Impuesto, V.Total, V.Fecha ,C.Nombre as Cliente, VE.Nombre as Vendedor
            FROM [${database}].[dbo].[VENTAS] AS V
            INNER JOIN [${database}].[dbo].[CLIENTES] AS C ON V.Id_Cliente = C.Id_Cliente AND V.Id_Almacen = C.Id_Almacen
            INNER JOIN [${database}].[dbo].[VENDEDORES] AS VE ON V.Id_Vendedor = VE.Id_Vendedor
            WHERE V.Id_Cliente = @Id_Cliente AND TipoDoc = ${TipoDocOO}
            ORDER BY Fecha DESC
        `

        const request = pool.request();
        request.input('Id_Cliente', sql.Int, Id_Cliente);

        const consult = await request.query(query);
        let results: OrderInterface[] = consult.recordset;

        res.json(results)

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