
import { request, Request, Response } from 'express'
import { dbConnection, querys, sql } from '../database';

const getProducts = async (req: Request, res: Response) => {

    try {
        const pool = await dbConnection();
        const result = await pool?.request().query(querys.getAllProducts);
        res.json(result?.recordset);
    } catch (error: any) {
        res.status(500);
        res.send(error.message);
    }

};

const createNewProduct = async (req: Request, res: Response) => {

    const { name, description } = req.body
    let { quantity } = req.body

    // validating
    if (description == null || name == null) {
        return res.status(400).json({ msg: "Bad Request. Please fill all fields" });
    }

    if (quantity == null) quantity = 0;


    try {
        const pool = await dbConnection()
        await pool
            ?.request()
            .input("name", sql.VarChar, name)
            .input("description", sql.Text, description)
            .input("quantity", sql.Int, quantity)
            .query(querys.addNewProduct)

        res.json({ name, description, quantity })
    } catch (error: any) {
        res.status(500)
        res.send(error.message);
    }
}

const getProducById = async (req: Request, res: Response) => {

    try {
        const pool = await dbConnection()
        const result = await pool
            ?.request()
            .input("id", req.params.id)
            .query(querys.getProducById)

        return res.json(result?.recordset[0]);
    } catch (error: any) {
        res.status(500)
        res.send(error.message);
    }

}


const deleteProductById = async (req: Request, res: Response) => {

    try {
        const pool = await dbConnection()
        const result = await pool
            ?.request()
            .input("id", req.params.id)
            .query(querys.deleteProduct)

        if (result?.rowsAffected[0] === 0) return res.sendStatus(404);

        return res.sendStatus(204);

    } catch (error: any) {
        res.status(500)
        res.send(error.message);
    }

}

const getTotalProducts = async (req: Request, res: Response) => {
    const pool = await dbConnection();

    const result = await pool?.request().query(querys.getTotalProducts);

    res.json(result?.recordset[0][""]);
};

const updateProduct = async (req: Request, res: Response) => {

    const { name, description } = req.body
    let { quantity } = req.body

    // validating
    if (description == null || name == null) {
        return res.status(400).json({ msg: "Bad Request. Please fill all fields" });
    }

    if (quantity == null) quantity = 0;


    try {
        const pool = await dbConnection()
        await pool
            ?.request()
            .input("name", sql.VarChar, name)
            .input("description", sql.Text, description)
            .input("quantity", sql.Int, quantity)
            .input("id", req.params.id)
            .query(querys.updateProductById)

        res.json({ name, description, quantity })
    } catch (error: any) {
        res.status(500)
        res.send(error.message);
    }
}

export {
    getProducts,
    createNewProduct,
    getProducById,
    deleteProductById,
    getTotalProducts,
    updateProduct
}