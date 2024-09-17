// Importar los tipos extendidos explícitamente
/// <reference path="../types/express.d.ts" />

import Router from "express";

import {
    getProducById,
    getProductByStockAndCodeBar,
    getProductsByStock,
    getTotalOfProductsByStock,
    
} from "../controllers/products/products";
import { validateJWT, validateJWTWeb } from "../helpers/validate-jwt";
import { getProducByIdWeb, getProducts, getTotalProducts } from "../controllers/products/productsWeb";


const router = Router()

// Web endpoints
router.get("/", validateJWTWeb, getProducts)
router.get("/web/:id", validateJWTWeb, getProducByIdWeb)
router.get("/count", validateJWTWeb, getTotalProducts)

// App endpoints
router.get("/byStock", validateJWT, getProductsByStock);
router.get("/byStockCount", validateJWT, getTotalOfProductsByStock);
router.get("/byStockAndCodeBar", validateJWT, getProductByStockAndCodeBar);

// This enndpoint is used in WEB and APP to get product details.
router.get("/:id", validateJWT, getProducById)





export default router;