import Router from "express";
import {
    getProducById,
    getProductByStockAndCodeBar,
    getProducts,
    getProductsByStock,
    getTotalProducts
} from "../controllers/products";


const router = Router()

router.get("/byStockAndCodeBar/:CodeBar", getProductByStockAndCodeBar)

router.get("/byStock", getProductsByStock)
router.get("/", getProducts)


router.get("/:id", getProducById)

router.get("/count", getTotalProducts)





export default router;