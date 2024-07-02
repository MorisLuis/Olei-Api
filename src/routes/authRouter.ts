import { Router } from "express";
import { loginDB, login, renewLogin, renewDB } from "../controllers/auth/auth";
import { validateJWTDB, validateJWT, validateJWTWeb } from "../helpers/validate-jwt";
import { loginWeb, logout, renewWeb } from "../controllers/auth/authWeb";

const router = Router();

router.post("/loginDB", loginDB);
router.post("/loginWeb", loginWeb);
router.post("/login", validateJWTDB, login);

router.post("/logout", logout);

router.get('/renew', validateJWTDB, renewDB)
router.get('/renewLogin', validateJWT, renewLogin)
router.get('/renewWeb', validateJWTWeb, renewWeb)

export default router;