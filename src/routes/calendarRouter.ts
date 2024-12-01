import { Router } from "express";
import { validateJWTWeb } from "../helpers/validate-jwt";
import { getCalendarTaskByDay, getCalendarTaskByMonth, getCalendarTaskByMonthAndClient } from "../controllers/calendar";


const router = Router();

router.get('/month', validateJWTWeb, getCalendarTaskByMonth);
router.get('/day', validateJWTWeb, getCalendarTaskByDay);
router.get('/monthAndClient', validateJWTWeb, getCalendarTaskByMonthAndClient);


export default router;