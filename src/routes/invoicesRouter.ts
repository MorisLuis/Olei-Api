import { Router } from "express";
import { validateJWTWeb } from "../helpers/validate-jwt";
import { getInvoice, getInvoices } from "../controllers/invoices";


const router = Router();

router.get("/", validateJWTWeb, getInvoices);
router.get("/:folio", validateJWTWeb, getInvoice);

export default router;