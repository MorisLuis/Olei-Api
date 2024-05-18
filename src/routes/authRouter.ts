import { Router } from "express";
import {  renew, loginDB, login, renewWeb, logout } from "../controllers/auth/auth";
import { validateJWT } from "../helpers/validate-jwt";

const router = Router();

router.post("/loginDB", loginDB);

router.post("/login", login);
router.post("/logout", logout);
router.get('/renew', validateJWT, renew)
router.get('/renewWeb', validateJWT, renewWeb)

export default router;