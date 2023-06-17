import { Request, Response } from 'express'
import { dbConnection, querys } from '../database';
import moment from 'moment';
import { generateJWT } from '../helpers/generate-jwt';


const login = async (req: Request, res: Response) => {
    try {
        const pool = await dbConnection();

        const { email, password } = req.body;

        // Buscar el usuario en la base de datos usando el correo electrónico
        const query_DBUsuariosool = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOSOOL] WHERE Id_UsuarioOOL = '${email}'`;
        const result = await pool?.request().query(query_DBUsuariosool);
        const user = result?.recordset[0];

        if (!user) {
            res.status(404).json({ error: 'Correo no encontrado' });
            return;
        }

        if (user.PasswordOOL.trim() !== password) {
            res.status(401).json({ error: 'Contraseña incorrecta' });
            return;
        }

        // Obtener la fecha de vencimiento de la suscripción del usuario
        const query_CLIENTES = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[CLIENTES] WHERE Id_Cliente = '${user.Id_ClienteDBCLIENTES}'`;
        const resultCliente = await pool?.request().query(query_CLIENTES);
        const dueDate = resultCliente?.recordset[0].Vigencia;

        // Comparar la fecha de vencimiento con el día de hoy
        const today = moment().startOf('day');
        const isExpired = moment(dueDate).startOf('day').isBefore(today);

        if (isExpired) {
            res.status(401).json({ error: 'La suscripción ha expirado' });
            return;
        }

        // Generar un token JWT para el usuario
        const token = await generateJWT(user.Id_UsuarioOOL, user.TipoUsuario);


        // Realizar la conexión a otra base de datos
        const otherDBServer = user.ServidorSQL.trim();
        const otherDBDatabase = user.BaseSQL.trim();

        await pool?.close();

        console.log({otherDBServer, otherDBDatabase})
        const otherPool = await dbConnection(otherDBServer, otherDBDatabase);

        const otherQuery = `SELECT TOP(10) * FROM [${otherDBDatabase}].[dbo].[PRODUCTOS]`;
        const resultProducts = await otherPool?.request().query(otherQuery);
        const productos = resultProducts?.recordset;

        console.log({productos})
    
        res.json({
            user,
            token
        });
    } catch (error: any) {
        res.status(500).send(error.message);
    }
};

export {
    login
}