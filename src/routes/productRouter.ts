import Router from "express"
import { getProducById, getProducts, getTotalProducts } from "../controllers/products";


const router = Router()

router.get( "/", getProducts)

router.get( "/:id", getProducById)

router.get( "/count", getTotalProducts)



export default router;