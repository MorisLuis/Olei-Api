import { Router } from "express";
import { validateJWTWeb } from "../helpers/validate-jwt";
import { getQuotes, getQuote } from "../controllers/quotes";


const router = Router();

router.get("/", validateJWTWeb, getQuotes);
router.get("/:folio", validateJWTWeb, getQuote);

export default router;