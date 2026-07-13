import { Router } from "express";

import { loginApp, logoutApp, refreshApp } from "../controllers/auth/client";
import { loginServer, logoutServer, refreshServer } from "../controllers/auth/database";
import { loginWeb, logout, renewWeb } from "../controllers/auth/authWeb";

import { validateJWTWeb } from "../middleware/validateJWTWeb";
import { validateJWTClient, validateJWTDatabase, validateRefreshToken } from "../middleware/validateJWT";

const router = Router();

// Web
router.post("/loginWeb", loginWeb);
router.get('/renewWeb', validateJWTWeb, renewWeb)
router.get("/logout", validateJWTWeb, logout);

// App
router.post("/loginServer", loginServer);
router.post("/login", validateJWTClient, loginApp);

router.get('/logoutServer', validateJWTClient, logoutServer);
router.get('/logoutUser', validateJWTDatabase, logoutApp);

router.post('/refreshServer', validateJWTClient, refreshServer);
router.post('/refresh', validateRefreshToken, refreshApp);

export default router;