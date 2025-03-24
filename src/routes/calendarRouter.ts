import { Router } from "express";
import { getCalendarTaskByDay, getCalendarTaskByMonth, getCalendarTaskByMonthAndClient } from "../controllers/calendar";
import { validateJWTWeb } from "../middleware/validateJWT";

const router = Router();

router.get('/month', validateJWTWeb, getCalendarTaskByMonth);
router.get('/day', validateJWTWeb, getCalendarTaskByDay);
router.get('/monthAndClient', validateJWTWeb, getCalendarTaskByMonthAndClient);

export default router;