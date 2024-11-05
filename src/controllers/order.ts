import { NextFunction, Request, Response } from "express"
import { dbConnection } from "../database";
import sql from 'mssql';
import OrderInterface from "../interface/order";
import { orderQuerys } from "../database/querys/orders";
import { handleGetWebSession } from "../utils/Redis/getSession";
import { convertArrayToXml } from "../utils/convertArrayToXml";
import { numeroALetra } from "../utils/numeroALetra";
import PorductInterface from "../interface/product";
import BadRequestError from '../errors/BadRequestError';


const postOrder = async (req: Request, res: Response, next: NextFunction) => {

    // Get session from REDIS.
    const sessionId = req.sessionRedis
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb, Id_ListPre, Id_Cliente, Id_Almacen, TipoDocOO } = userFR;

    try {
        const pool = await dbConnection(Serverweb, Baseweb);
        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        };

        const { sellsDetails, sellsData } = req.body;
        const { Subtotal, Total } = sellsData ?? {}

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        const request = new sql.Request(transaction);

        const TotalImpuesto = Total - Subtotal;
        const CantLetra = numeroALetra(Total);

        const xmlDataSales = await convertArrayToXml(sellsData);
        const xmlDataSalesDetails = await convertArrayToXml(sellsDetails);

        const result = await request
            .input('xmlDataSales', sql.Xml, xmlDataSales)
            .input('xmlDataSalesDetails', sql.Xml, xmlDataSalesDetails)
            .input('Id_Usuario', sql.Int, 1)
            .input('Id_Almacen', sql.Int, Id_Almacen)
            .input('Id_Cliente', sql.Int, Id_Cliente)
            .input('Id_ListPre', sql.Int, Id_ListPre)
            .input('TipoDoc', sql.Int, TipoDocOO)
            .input('CantLetra', sql.VarChar, CantLetra)
            .input('TotalImpuesto', sql.Decimal, TotalImpuesto)
            .output('Folio', sql.Int)
            .execute('fn_ExecuteSales');

        await transaction.commit();

        const folio = result.recordset[0].Folio

        res.status(201).json({
            ok: true,
            folio
        });

    } catch (error) {
        next(error)
    }
};

const getOrder = async (req: Request, res: Response, next: NextFunction) => {

    // Get session from REDIS.
    const sessionId = req.sessionRedis
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;

    try {
        const { folio } = req.params;
        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        const getOrderQuery = orderQuerys.getOrder;

        const request = await pool.request()
            .input('Id_Cliente', sql.Int, Id_Cliente)
            .input('folio', sql.Int, folio)
            .input('TipoDocOO', TipoDocOO)
            .query(getOrderQuery);

        let order = request.recordset[0];

        res.json(order)

    } catch (error) {
        next(error)
    }
}

const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {

    // Get session from REDIS.
    const sessionId = req.sessionRedis
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;

    try {
        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        const query = orderQuerys.getAllOrders;

        const request = await pool.request()
            .input('TipoDocOO', TipoDocOO)
            .input('Id_Cliente', sql.Int, Id_Cliente)
            .query(query);


        let allOrders: OrderInterface[] = request.recordset;

        res.json(allOrders);

    } catch (error) {
        next(error)
    }
}

const getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {

    // Get session from REDIS.
    const sessionId = req.sessionRedis
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    };
    const { Serverweb, Baseweb } = userFR;

    try {
        const { folio } = req.query;

        const pool = await dbConnection(Serverweb, Baseweb);
        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        };

        const query = orderQuerys.getOrderDetails;
        const request = await pool.request()
            .input('folio', sql.Int, folio)
            .query(query);

        let orderDetails: PorductInterface[] = request.recordset;
        res.json(orderDetails)

    } catch (error) {
        next(error)
    }
}

export {
    postOrder,
    getOrder,
    getAllOrders,
    getOrderDetails
}