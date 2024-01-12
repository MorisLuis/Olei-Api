import { Router } from "express";
import { getInventory, getInventoryDetails, postInventory, postInventoryDetails } from "../controllers/inventory";


const router = Router();

router.get('/', getInventory);
router.get('/inventoryDetails', getInventoryDetails);

router.post('/', postInventory);
router.post('/inventoryDetails', postInventoryDetails);


export default router;