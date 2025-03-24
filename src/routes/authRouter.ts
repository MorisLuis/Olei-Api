import { Router } from "express";
import { loginServer, login, logoutUser, logoutServer, refresh } from "../controllers/auth/auth";
import { validateJWT, validateJWTLogin, validateJWTWeb, validateRefreshJWT } from "../middleware/validateJWT";
import { loginWeb, logout, renewWeb } from "../controllers/auth/authWeb";

const router = Router();

// Web
router.post("/loginWeb", loginWeb);
router.get('/renewWeb', validateJWTWeb, renewWeb)
router.get("/logout", validateJWTWeb, logout);

// App
router.post("/loginServer", loginServer);
router.post("/login", validateJWTLogin, login);

router.get('/logoutUser', validateJWT, logoutUser);
router.get('/logoutServer', validateJWT, logoutServer);

router.post('/refresh', validateRefreshJWT, refresh);

export default router;