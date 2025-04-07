import { dbConnection } from "../database";
import { verifyIfIsEAN13 } from "../utils/identifyBarcodeType";
import { costosQuerys } from "../database/querys/costos";
import { v4 as uuidv4 } from 'uuid';
import sql from 'mssql';
import { ValidationError } from "../errors/CustomError";
import type { UserSessionInterface } from "../interface/user";

type updateCodbar = {
    CodBar: string;
    codeRandom: string
};

const updateCodebarService = async (
    userSession: UserSessionInterface,
    codigoParam: string,
    Id_Marca: number,
    body: updateCodbar
): Promise<{ codigo: string, CodBar: string }> => {


    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = userSession;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
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
        throw new ValidationError('Se requieren los parámetros "codigo" e "Id_Marca" en la consulta.')
    };

    const query = costosQuerys.updateCostos;

    // Codebar random
    if (codeRandom === "true") {
        const uniqueId = uuidv4();
        const codeBarRandom = uniqueId.replace(/-/g, '').substring(0, 10);
        CodBar = codeBarRandom
    }

    const request = new sql.Request(transaction);
    request.input('codigo', sql.NVarChar, codigoParam);
    request.input('Id_Marca', sql.Int, Id_Marca);
    request.input('CodBar', sql.NVarChar, CodBar);

    await request.query(query);
    await transaction.commit();

    return {
        codigo: codigoParam,
        CodBar
    }
};


export {
    updateCodebarService
}