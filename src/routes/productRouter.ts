import Router from "express";
import {
    getProducById,
    getProductByStockAndCodeBar,
    getProducts,
    getProductsByStock,
    getTotalProducts
} from "../controllers/products";


const router = Router()

router.get("/byStock", getProductsByStock)
router.get("/byStockAndCodeBar", getProductByStockAndCodeBar)
router.get("/:id", getProducById)
router.get("/", getProducts)



router.get("/count", getTotalProducts)





export default router;