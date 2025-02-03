import { Router } from "express";
import { validateJWT, validateJWTWeb } from "../helpers/validate-jwt";
import { getAlmacenes, getCodigos, getFamilias, getMarcas } from "../controllers/search/search";


const router = Router()

// App endpoints
//router.get("/inventory", validateJWT, searchProductInventory)

// Web endpoints
router.get("/familias", validateJWTWeb, getFamilias);
router.get("/marcas", validateJWTWeb, getMarcas);
router.get("/codigos", validateJWTWeb, getCodigos);
router.get("/almacenes", validateJWT, getAlmacenes);

//router.get("/", validateJWTWeb, searchProduct)
//router.get("/client", validateJWTWeb, searchClient)

export default router;