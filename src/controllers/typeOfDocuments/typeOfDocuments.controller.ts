import type { NextFunction, Request, Response } from "express"
import { dbConnection } from "../../database";
import { typeOfDocumentsQuery } from "../../database/querys/typeOfDocuments";
import { successResponse } from "../../helpers/response";



const getTypeOfDocuments = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const session = req.session;
        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = session;
        const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
        const query = typeOfDocumentsQuery.getTypeOfDocuments;

        const result = await pool.request()
            .query(query)
        const response = result.recordset
        

        return successResponse(req, res, response, "Operation successful", 200);

    } catch (error) {
        return next(error)
    }
}

export {
    getTypeOfDocuments
}