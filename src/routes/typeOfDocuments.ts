import Router from "express";
import { getTypeOfDocuments } from "../controllers/typeOfDocuments/typeOfDocuments.controller";
import { validateJWT } from "../middleware/validateJWT";


const router = Router();

router.get("/", validateJWT, getTypeOfDocuments)

export default router