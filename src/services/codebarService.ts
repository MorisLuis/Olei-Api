import { dbConnection } from "../database";
import BadRequestError from "../errors/BadRequestError";
import { handleGetSession } from "../utils/Redis/getSession";
import { verifyIfIsEAN13 } from "../utils/identifyBarcodeType";
import { costosQuerys } from "../database/querys/costos";
import { v4 as uuidv4 } from 'uuid';
import sql from 'mssql';

type updateCodbar = {
    CodBar: string;
    codeRandom: string
};

const updateCodebarService = async (sessionId: string, codigoParam: string, Id_Marca: string, body: updateCodbar) => {

    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = userFR;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let { CodBar, codeRandom } = body;

    let isEAN13 = false;
    if (CodBar) {
        isEAN13 = verifyIfIsEAN13(body.CodBar)
    };

    if (isEAN13) {
        CodBar = CodBar?.substring(1)
    };

    if (!codigoParam || !Id_Marca) {
        await transaction.rollback();
        throw new BadRequestError({ code: 404, message: `Se requieren los parámetros "codigo" e "Id_Marca" en la consulta.`, logging: true });
    };

    const request = new sql.Request(transaction);
    request.input('codigo', sql.NVarChar, codigoParam);
    request.input('Id_Marca', sql.Int, Id_Marca);

    const keys = Object.keys(body);
    const query = costosQuerys.updateCostos;

    // Codebar random
    if (codeRandom === "true") {
        const uniqueId = uuidv4();
        const codeBarRandom = uniqueId.replace(/-/g, '').substring(0, 10);
        CodBar = codeBarRandom
    }

    // Make forEach to create de SET of the query.
    keys.forEach((key) => {
        if (key === 'codeRandom') {
            request.input('CodBar', sql.NVarChar, body['CodBar']);
        }
    });

    await request.query(query);
    await transaction.commit();

    return { ok: true }
};


export {
    updateCodebarService
}