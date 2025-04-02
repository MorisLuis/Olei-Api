import { Router } from "express";
import { deleteMeeting, getMeetingById, getMeetings, getTotalMeetings, postMeeting, updateMeeting } from "../controllers/bitacora";
import { validateJWTWeb } from "../middleware/validateJWT";


const router = Router();

router.get('/', validateJWTWeb, getMeetings);
router.get('/total', validateJWTWeb, getTotalMeetings);

router.get('/:id', validateJWTWeb, getMeetingById);
router.put('/:id', validateJWTWeb, updateMeeting);
router.post('/', validateJWTWeb, postMeeting);
router.delete('/:id', validateJWTWeb, deleteMeeting);

export default router;