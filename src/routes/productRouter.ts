import Router from "express"
import { deleteProductById, getProducById, getProducts, getTotalProducts } from "../controllers/products";


const router = Router()

router.get( "/", getProducts)

//router.post( "/", createNewProduct)

router.get( "/:id", getProducById)

router.delete( "/:id", deleteProductById)

router.get( "/count", getTotalProducts)

//router.put( "/:id", updateProduct)


export default router;