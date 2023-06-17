import { Router } from "express";
import { getUsers } from "../controllers/users";


const router = Router();

router.get("/", getUsers)

//router.post();

//router.get('/renew', validateJWT, renew)

export default router;