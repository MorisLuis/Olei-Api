// Importar los tipos extendidos explícitamente
/// <reference path="../../typings/express.d.ts" />

import Router from "express";

import {
    getProducById,
    getProductByStockAndCodeBar,
    getProductsByStock,
    getTotalProducts
} from "../controllers/products/products";
import { validateJWT, validateJWTWeb } from "../helpers/validate-jwt";
import { getProducByIdWeb, getProducts } from "../controllers/products/productsWeb";


const router = Router()

router.get("/byStock", validateJWT, getProductsByStock)
router.get("/byStockAndCodeBar", validateJWT, getProductByStockAndCodeBar)

// This enndpoint is used in WEB and APP to get product details.
router.get("/:id", validateJWT, getProducById)
router.get("/web/:id", validateJWTWeb, getProducByIdWeb)
router.get("/", validateJWTWeb, getProducts)

router.get("/count", getTotalProducts)





export default router;