import { Router } from "express";
import { getSellById, getSells, getSellsByClient, getSellsByClientCountAndTotal, getSellsCountAndTotal } from "../controllers/sells/sells";
import { getCobranza, getCobranzaByClient, getCobranzaByClientCountAndTotal, getCobranzaCountAndTotal, getCobranzaWithTotals } from "../controllers/sells/cobranza";
import { getSellsProducts, getSellsProductsCountAndTotal } from "../controllers/sells/productsSells";
import { validateJWTWeb } from "../middleware/validateJWTWeb";


const router = Router();
router.get("/", validateJWTWeb, getSells);
router.get("/totals", validateJWTWeb, getSellsCountAndTotal);
router.get("/:folio", validateJWTWeb, getSellById);
router.get("/client/:client", validateJWTWeb, getSellsByClient);
router.get("/client/totals/:client", validateJWTWeb, getSellsByClientCountAndTotal);

router.get("/products/data", validateJWTWeb, getSellsProducts);
router.get("/products/totals", validateJWTWeb, getSellsProductsCountAndTotal);

router.get("/cobranza/clients", validateJWTWeb, getCobranza);
router.get("/cobranza/clients/totals", validateJWTWeb, getCobranzaCountAndTotal);
router.get("/cobranza/:client", validateJWTWeb, getCobranzaByClient);
router.get("/cobranza/totals/:client", validateJWTWeb, getCobranzaByClientCountAndTotal);
router.get("/cobranza/getCobranzaWithTotals/:client", validateJWTWeb, getCobranzaWithTotals);

export default router;