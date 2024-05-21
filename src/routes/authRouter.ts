import { Router } from "express";
import {  renew, loginDB, login } from "../controllers/auth/auth";
import { validateJWT } from "../helpers/validate-jwt";
import { loginWeb, logout, renewWeb } from "../controllers/auth/authWeb";

const router = Router();

router.post("/loginDB", loginDB);

router.post("/login", login);
router.post("/loginWeb", loginWeb);

router.post("/logout", logout);
router.get('/renew', validateJWT, renew)
router.get('/renewWeb', validateJWT, renewWeb)

export default router;