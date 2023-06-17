import { Router } from "express";
import { login } from "../controllers/auth";

const router = Router();

router.post("/login", login);

//router.get('/renew', validateJWT, renew)

export default router;