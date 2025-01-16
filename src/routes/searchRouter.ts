import { Router } from "express";
import { validateJWTWeb } from "../helpers/validate-jwt";
import { getCodigos, getFamilias, getMarcas } from "../controllers/search/search";


const router = Router()

// App endpoints
//router.get("/inventory", validateJWT, searchProductInventory)

// Web endpoints
router.get("/familias", validateJWTWeb, getFamilias);
router.get("/marcas", validateJWTWeb, getMarcas);
router.get("/codigos", validateJWTWeb, getCodigos);

//router.get("/", validateJWTWeb, searchProduct)
//router.get("/client", validateJWTWeb, searchClient)

export default router;