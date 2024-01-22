import { Router } from "express";
import { login, logout, renew } from "../controllers/auth";
import { validateJWT } from "../helpers/validate-jwt";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get('/renew', validateJWT, renew)

export default router;