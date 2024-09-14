import { Router } from "express";
import { loginDB, login, renewLogin, renewDB, logoutUser, logoutDB } from "../controllers/auth/auth";
import { validateJWTDB, validateJWT, validateJWTWeb } from "../helpers/validate-jwt";
import { loginWeb, logout, renewWeb } from "../controllers/auth/authWeb";

const router = Router();

// Web
router.post("/loginWeb", loginWeb);
router.get('/renewWeb', validateJWTWeb, renewWeb)
router.get("/logout", logout);

// App
router.post("/loginDB", loginDB);
router.post("/login", validateJWTDB, login);
router.get('/renew', validateJWTDB, renewDB)
router.get('/renewLogin', validateJWT, renewLogin)

router.get('/logoutApp', validateJWT, logoutUser)
router.get('/logoutAppDB', validateJWTDB, logoutDB)


export default router;