import { Router } from "express";
import { getClientId, getClients, getTotalClients, searchClient, selectClient, updateClient } from "../controllers/clients/client.controller";
import { validateJWTWeb } from "../middleware/validateJWTWeb";


const router = Router();
router.get('/', validateJWTWeb, getClients)
router.get('/total', validateJWTWeb, getTotalClients)
router.get('/clientId', validateJWTWeb, getClientId)

router.post('/', validateJWTWeb, selectClient)
router.get("/search", validateJWTWeb, searchClient)

router.put("/:id", validateJWTWeb, updateClient)

export default router;