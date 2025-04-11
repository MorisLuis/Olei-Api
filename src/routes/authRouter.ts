import { Router } from "express";
import { loginServer, login, logoutUser, logoutServer, refresh, refreshServer } from "../controllers/auth/auth";
import { validateJWTServer, validateJWTWeb, validateJWTRefresh } from "../middleware/validateJWT";
import { loginWeb, logout, renewWeb } from "../controllers/auth/authWeb";
import { errorTest } from "../controllers/products/products";

const router = Router();

// Web
router.post("/loginWeb", loginWeb);
router.get('/renewWeb', validateJWTWeb, renewWeb)
router.get("/logout", validateJWTWeb, logout);

// App
router.post("/loginServer", loginServer);
router.post("/login", validateJWTServer, login);

router.get('/logoutServer', validateJWTServer, logoutServer);
router.get('/logoutUser', validateJWTServer, logoutUser);

router.post('/refreshServer', validateJWTServer, refreshServer);
router.post('/refresh', validateJWTRefresh, refresh);

router.get('/error-test', errorTest)

export default router;