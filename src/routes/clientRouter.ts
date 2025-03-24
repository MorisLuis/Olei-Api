import { Router } from "express";
import { getClientId, getClients, getTotalClients, searchClient, selectClient } from "../controllers/client";
import { validateJWTWeb } from "../middleware/validateJWT";


const router = Router();
router.get('/', validateJWTWeb, getClients)
router.get('/total', validateJWTWeb, getTotalClients)
router.get('/clientId', validateJWTWeb, getClientId)

router.post('/', validateJWTWeb, selectClient)
router.get("/search", validateJWTWeb, searchClient)

export default router;