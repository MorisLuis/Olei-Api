import { Router } from "express";
import { getUsers } from "../controllers/users";
import { validateJWTWeb } from "../helpers/validate-jwt";


const router = Router();

router.get("/", validateJWTWeb, getUsers)

export default router;