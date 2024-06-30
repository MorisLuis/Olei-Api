// Importar los tipos extendidos explícitamente
/// <reference path="../../typings/express.d.ts" />

import Router from "express";

import {
    getProducById,
    getProductByStockAndCodeBar,
    getProducts,
    getProductsByStock,
    getTotalProducts
} from "../controllers/products";
import { validateJWT } from "../helpers/validate-jwt";


const router = Router()

router.get("/byStock", validateJWT ,getProductsByStock)
router.get("/byStockAndCodeBar", validateJWT, getProductByStockAndCodeBar)

// This enndpoint is used in WEB and APP to get product details.
router.get("/:id", validateJWT, getProducById)

router.get("/", getProducts)



router.get("/count", getTotalProducts)





export default router;