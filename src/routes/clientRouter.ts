import { Router } from "express";
import { getClientId, getClients, selectClient } from "../controllers/client";
import { validateJWTWeb } from "../helpers/validate-jwt";


const router = Router();
router.get('/', validateJWTWeb, getClients)
router.get('/clientId', validateJWTWeb, getClientId)

router.post('/', validateJWTWeb, selectClient)

export default router;