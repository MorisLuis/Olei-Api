import { Router } from "express";
import { login, logout } from "../controllers/auth";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);

//router.get('/renew', validateJWT, renew)

export default router;