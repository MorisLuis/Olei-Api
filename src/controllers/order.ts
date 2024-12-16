import { NextFunction, Request, Response } from "express"
import { dbConnection } from "../database";
import sql from 'mssql';
import { orderQuerys } from "../database/querys/orders";
import { handleGetWebSession } from "../utils/Redis/getSession";
import { convertArrayToXml } from "../utils/convertArrayToXml";
import { numeroALetra } from "../utils/numeroALetra";
import BadRequestError from '../errors/BadRequestError';
import { getOrderDetailsQuerrySchema, getTotalOrderDetailsQuerrySchema } from '../validations/orderValidations';
import { getOrderDetailsSells, getTotalOrderDetailsSells } from "../services/orderServices";

const postOrder = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { Serverweb, Baseweb, Id_ListPre, Id_Cliente, Id_Almacen, TipoDocOO } = userFR;
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


    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;
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


    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;
        const { page, limit } = req.query;

        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        const query = orderQuerys.getAllOrders;

        const request = await pool.request()
            .input('TipoDocOO', TipoDocOO)
            .input('Id_Cliente', sql.Int, Id_Cliente)
            .input('PageNumber', sql.Int, page)
            .input('PageSize', sql.Int, limit)
            .query(query);

        let allOrders = request.recordset;

        res.json(allOrders);

    } catch (error) {
        next(error)
    }
}

const getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const { folio, PageNumber } = getOrderDetailsQuerrySchema.parse(req.query);

        // Get session from REDIS.
        const sessionId = req.sessionRedis

        const orderDetails = await getOrderDetailsSells({
            folio,
            PageNumber,
            sessionId
        })

        res.json(orderDetails)

    } catch (error) {
        next(error)
    }
}

const getTotalOrderDetails = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const { folio } = getTotalOrderDetailsQuerrySchema.parse(req.query);

        // Get session from REDIS.
        const sessionId = req.sessionRedis

        const orderDetails = await getTotalOrderDetailsSells({
            folio,
            sessionId
        })

        res.json(orderDetails)

    } catch (error) {
        next(error)
    }
}

const getTotalOrders = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;

        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        const result = await pool?.request()
            .input('TipoDocOO', TipoDocOO)
            .input('Id_Cliente', sql.Int, Id_Cliente)
            .query(orderQuerys.getTotalOrders);

        res.json({ total: result?.recordset[0][""] });

    } catch (error) {
        next(error)
    }
};


export {
    postOrder,
    getOrder,
    getAllOrders,
    getOrderDetails,
    getTotalOrders,
    getTotalOrderDetails
}