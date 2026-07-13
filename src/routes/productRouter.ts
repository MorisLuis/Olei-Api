// Importar los tipos extendidos explícitamente
/// <reference path="../types/express.d.ts" />

import Router from "express";

import {
    getProducById,
    getProductByStockAndCodeBar,
    getProductsByStock,
    getTotalOfProductsByStock,
    
} from "../controllers/products/products";
import { getProducByIdWeb, getProducts, getTotalProducts, searchProduct } from "../controllers/products/productsWeb";
import { validateJWTClient } from "../middleware/validateJWT";
import { validateJWTWeb } from "../middleware/validateJWTWeb";


const router = Router()

// Web endpoints
router.get("/", validateJWTWeb, getProducts)
router.get("/web/:id", validateJWTWeb, getProducByIdWeb)
router.get("/count", validateJWTWeb, getTotalProducts)
router.get("/search", validateJWTWeb, searchProduct)

// App endpoints
router.get("/byStock", validateJWTClient, getProductsByStock);
router.get("/byStockCount", validateJWTClient, getTotalOfProductsByStock);
router.get("/byStockAndCodeBar", validateJWTClient, getProductByStockAndCodeBar);

// This enndpoint is used in WEB and APP to get product details.
router.get("/:id", validateJWTClient, getProducById) // Verify > if a i used this endpoint.





export default router;