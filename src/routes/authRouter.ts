import { Router } from "express";
import { loginServer, login, logoutUser, logoutServer, refresh, refreshServer } from "../controllers/auth/auth";
import { loginWeb, logout, renewWeb } from "../controllers/auth/authWeb";
import { validateJWT, validateJWTWeb, validateJWTokenServer, validateRefreshToken } from "../middleware/validateJWT";

const router = Router();

// Web
router.post("/loginWeb", loginWeb);
router.get('/renewWeb', validateJWTWeb, renewWeb)
router.get("/logout", validateJWTWeb, logout);

// App
router.post("/loginServer", loginServer);
router.post("/login", validateJWT, login);

router.get('/logoutServer', validateJWT, logoutServer);
router.get('/logoutUser', validateJWTokenServer, logoutUser);

router.post('/refreshServer', validateJWT, refreshServer);
router.post('/refresh', validateRefreshToken, refresh);

export default router;