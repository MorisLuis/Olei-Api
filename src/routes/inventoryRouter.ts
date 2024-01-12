import { Router } from "express";
import { postInventory, postInventoryDetails } from "../controllers/inventory";


const router = Router();

router.post('/', postInventory);
router.post('/inventoryDetails', postInventoryDetails);


export default router;