import { Router } from "express";
import { getVendedorById, getVendedores } from "../controllers/vendedores";
import { validateJWTClient } from "../middleware/validateJWT";

const router = Router();

router.get("/", validateJWTClient, getVendedores);
router.get("/:id", validateJWTClient, getVendedorById);

export default router;
