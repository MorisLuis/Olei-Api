import { Router } from "express";
import { loginServer, login, logoutUser, logoutServer, refresh, refreshServer } from "../controllers/auth/auth";
import { validateJWT, validateJWTLogin, validateJWTWeb, validateRefreshJWT } from "../middleware/validateJWT";
import { loginWeb, logout, renewWeb } from "../controllers/auth/authWeb";
import { errorTest } from "../controllers/products/products";

const router = Router();

// Web
router.post("/loginWeb", loginWeb);
router.get('/renewWeb', validateJWTWeb, renewWeb)
router.get("/logout", validateJWTWeb, logout);

// App
router.post("/loginServer", loginServer);
router.post("/login", validateJWTLogin, login);

router.get('/logoutServer', validateJWTLogin, logoutServer);
router.get('/logoutUser', validateJWT, logoutUser);

router.post('/refreshServer', validateJWTLogin, refreshServer);
router.post('/refresh', validateRefreshJWT, refresh);

router.get('/error-test', errorTest)

export default router;