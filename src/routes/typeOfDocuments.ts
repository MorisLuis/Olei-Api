import Router from "express";
import { getTypeOfDocuments } from "../controllers/typeOfDocuments/typeOfDocuments.controller";
import { validateJWTClient } from "../middleware/validateJWT";


const router = Router();

router.get("/", validateJWTClient, getTypeOfDocuments)

export default router